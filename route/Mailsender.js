// getting router 
const router = require("express").Router();
const {User}=require("../models/userSchema");
const dotenv=require("dotenv");
const nodemailer=require("nodemailer");
const genOtp = require("./genOtp");
// requiring node cache for storing otp 
const NodeCache =require('node-cache');


var i =0;

// transporter for nodemail 

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASS
    }
  });


// --------------------------------for emailsender---------------------------------------
router.post("/",async(req,res) =>{
  try{
    console.log("emailSender")
    console.log(req.body);
    const user = await User.findOne({email: req.body.email});
    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: user.email,
      subject: req.body.subject,
     html: `<div>${req.body.message}</div>`
    ,
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
    i++;
      if (error) {
        res.json({ EmailSent:false });
        console.log(error);
      } else {
        res.json({ EmailSent: true });
        console.log("Email sent successfully for the "+i+" time !");
      }
    });
  

  console.log("inside mailsender router");

  console.log(req.body);
  }
  catch(error){
    console.log(error);
  }
})



// if attendance is marked 
router.post("/attendance",async(req,res)=>{

  try{

    const user = await User.findOne({enrollment: req.body.text});
    
    var mailOptions = {
        from: process.env.SMTP_MAIL,
        to: user.email,
        subject: req.body.subject,
        html: `
        <h1>Hello there!</h1>
        <h2>${user.name}</h2>
        <p>Enrollment: ${req.body.text}</p>
        <p> We are glad to Inform you attendance has been marked for drive</p>
        
        <p>Variable 2: ${req.body.subject}</p>
      `,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
      i++;

        if (error) {
          res.json({ EmailSent: false });
          console.log(error);
        } else {
            
          console.log("Email sent successfully for the "+i+" time !");
          res.json({ EmailSent: true });
        }
      });
    





    
    console.log("inside mailsender router");

    console.log(req.body);
    }
    catch(error){
      console.log(error)
    }

})



// ----------------------------------------------------------------

// intiating new cache 
const otpCache = new NodeCache();
const OTP_EXPIRATION_SECONDS = 180; // 3 minutes


router.post("/sendotp",async(req,res)=>{

  try{
    const otp = genOtp();
    console.log(otp +" otp");
    
    // generating otp time set and saving everything in cache 

    const otpCreationTime =Date.now();
    //  cache saved 
    otpCache.set(req.body.email,{otp,creationTime:otpCreationTime},OTP_EXPIRATION_SECONDS);
    
    // finding user with same mail 
    const user = await User.findOne({email: req.body.email});
    
    var mailOptions = {
        from: process.env.SMTP_MAIL,
        to: req.body.email,
        subject: " OTP for Reset Password PRM",
        html: `
        <h1>Hello there!</h1>
        <h2>${user.name}</h2>
        <p> As per your request to rest passwor here is </p>
        <p> OTP to reset your password is : ${otp}</p>
      `,
      };
    
      transporter.sendMail(mailOptions, function (error, info) {
      i++;

        if (error) {
          console.log(error);
          res.json({ otpSent: false });
        } 
        
        else {
           
          console.log("Email sent successfully for otp for  the "+i+" time !");
          res.json({ otpSent: true });
        }
      });
    
    
    console.log("inside otpmailer router");
    }
    catch(error){
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }

})



// veriy otp 

router.post('/verifyotp', async (req, res) => {

  console.log("inside otp verification");

  // getting email and enterend otp 

  try {
    const { email, enteredOtp } = req.body;

    // fetched cacehd email for otp

    const cachedOtpData = otpCache.get(email);
    

    if (!cachedOtpData) {
      return res.status(400).json({ message: 'OTP Expired' });
    }
    // fetching otp and creation time 
    const { otp, creationTime } = cachedOtpData;
    console.log("found otp for user");
    console.log(cachedOtpData);
    console.log("entered otp is "+enteredOtp);
    const currentTime = Date.now();
    const timeElapsedInSeconds = Math.floor((currentTime - creationTime) / 1000);

    if (timeElapsedInSeconds > OTP_EXPIRATION_SECONDS) {
      otpCache.del(email); // Remove expired OTP from the cache
      return res.json({status: 400, message: 'OTP Expired' });
    }

    if (enteredOtp === otp) {
      otpCache.del(email); // Remove verified OTP from the cache
      return res.json({status: 200, message: 'OTP Verified ' });
    } else {
      return res.json({status: 400, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: 500,message: 'Server error' });
  }
});



module.exports=router
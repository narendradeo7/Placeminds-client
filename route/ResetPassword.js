const router = require("express").Router();
const {User}=require("../models/userSchema");
const bcrypt = require("bcrypt");


router.post("/",async(req,res)=>{

    try{
        

        // getting hold of email and new password 

        const {email,newPassword}= req.body;
        // getting hold of user 
        const user =await User.findOne({email});

        // if user is there 

        if (!user){
            return res.json({status:400,messsage:'User not found'});
        }
        //  else 
        // updating password 
  // Password Hashing
  const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password=hashPassword;
        await user.save();
        return res.json({status:200,message:'Password updated'})

    }
     catch(error){
        console.log(error);
        res.json({status:500,message:' server error'});

    }


})


module.exports= router
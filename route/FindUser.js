// getting router 
const router = require("express").Router();
const {User}=require("../models/userSchema");
const dotenv=require("dotenv");



router.post("/", async(req,res)=>{
    try{
          const query = {};
          query[req.body.varname] = req.body.varval;
          const user = await User.findOne(query);

          if (user) {
            res.json({ exists: true });
          } else {
            res.json({ exists: false });
          }
        } 
         catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Server error' });
        }
})


// router to find many user and its details in control panel

router.post("/findusers", async(req,res)=>{
  try{
        const query = {};
        query[req.body.searchBy] = {
          $regex: req.body.searchInp,
          $options: "i" // Case-insensitive match
      };
        const users = await User.find(query);

        if (users) {

          const UserData = users.map(user=>{
            return{
              name: user.name,
              email: user.email,
              enrollment: user.enrollment,
              contact: user.contact,
              branch: user.branch,
              year: user.year,
              gender: user.gender,
              dob: user.dob,
              id: user._id,
              isAdmin: user.isAdmin,
              
            }
          })

          res.json(UserData);
        } else {
          res.status(423).json({ message: 'Unable to find ' });
        }
      } 
       catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
})




module.exports=router; 
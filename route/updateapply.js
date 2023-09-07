const router = require("express").Router();
const { User } = require("../models/userSchema");

router.post("/", async (req, res) => {

    try {

        //Getting Drivedata as datadrive and UserData as userdata from frontend
        const { datadrive, userData } = req.body;

        //Finding user from database using email to update that user applied for drive
        const user = await User.findOne({ email: userData.email });

        //If no such user is found then return error
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Find the drive in the user's drives array and update the 'applied' field to true
        const driveIndex = user.drives.findIndex(d => {
            return d.drivecode === datadrive.drivecode;
        });
        //In driveIndex we got at what index of Drives array is that drive on which user is applying
        //If driveIndex found then driveIndex will not be equal to -1 and then we will set Applied = True
        if (driveIndex !== -1) {
            user.drives[driveIndex].applied = true;
            await user.save();
        }
        //If no drivecode matches
        else {
            return res.status(404).json({ message: "Error, No Drive Found" });
        }

        //Sending success message of updation Applied = true
        res.status(201).json({ message: "Update successfull", userdata: user });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
        console.log(error);
    }

})

module.exports = router;
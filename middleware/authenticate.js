const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");
const Drive = require("../models/driveSchema")
const dotenv = require("dotenv");

const authenticate = async (req, res, next) => {

    try {
        //Verifying user cookie token with private key
        const token = req.cookies.jwtoken;
        if (!token) {
            return next();
        }

        const verifyToken = jwt.verify(token, process.env.JWTPRIVATEKEY);

        //finding detail of user using id of user that we get from verifytoken
        const rootUser = await User.findOne({ _id: verifyToken._id });
        const drive = await Drive.find({});


        if (!rootUser) {
            throw new Error("User not found");
        }

        req.token = token;
        req.rootUser = rootUser;
        req.driveDetail = drive;
        req.userID = rootUser._id;

        next();

    } catch (error) {
        console.log(error)
        next();
    }

}

module.exports = authenticate
const router = require("express").Router();
const Drive = require("../models/driveSchema");
const { User, validate } = require("../models/userSchema");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
	try {

		//Validating if all fields are filled or not
		const { error } = validate(req.body);

		//All fields not filled properly
		if (error) {
			return res.status(422).json({ error: "Please Fill All Fields Properly" });
		}

		//Checking if email already exist
		// const user = await User.findOne({ email: req.body.email });

		// //If user exists then show error
		// if (user) {
		// 	return res.status(422).json({ error: "User with given email already Exist!" });
		// }

		// else {
		// Password Hashing
		const hashPassword = await bcrypt.hash(req.body.password, 10);

		// Getting all drive details in drives
		const drives = await Drive.find();

		//Creating blank array to store all drivecodes and applied = false
		const drivecodes = [];
		for (const drive of drives) {
			drivecodes.push({ drivecode: drive.drivecode, applied: false })
		}

		/*Here we are saving drivecodes, as drivecode gets updated to all users when drive is published, 
		but old drivecodes can be show to that user, so to show that we find all drives from Database 
		and save its drivecode to user drives array with applied = false.*/

		// Updating Hashed Password , All drivecodes and Saving in Database
		await new User({ ...req.body, password: hashPassword, drives: drivecodes }).save();

		// Sending respose of user created successfully
		res.status(201).json({ message: "User created successfully" });
	}
	catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
		console.log(error)
	}
});

router.post("/update", async (req, res) => {
	try {
		const { updatedStudentData } = req.body
		console.log(updatedStudentData)
		//Checking if email already exist
		const user = await User.findOne({ _id: updatedStudentData.id });

		//If user exists then show error
		if (!user) {
			return res.status(422).json({ error: "User Not Found" });
		}

		else {

			user.name = updatedStudentData.name
			user.email = updatedStudentData.email
			user.contact = updatedStudentData.contact
			user.branch = updatedStudentData.branch
			user.year = updatedStudentData.year
			user.gender = updatedStudentData.gender
			user.dob = updatedStudentData.dob

			await user.save();

			// Sending respose of user created successfully
			res.status(201).json({ message: "User Details Updated successfully" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
		console.log(error)
	}
});

router.post("/update_userimg", async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.body.id });

		//If user exists then show error
		if (!user) {
			return res.status(422).json({ error: "User Not Found" });
		}

		else {

			user.userimgurl = req.body.newurl

			await user.save();

			// Sending respose of user created successfully
			res.status(201).json({ message: "User Details Updated successfully" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
		console.log(error)
	}
});

router.post("/admin", async (req, res) => {
	try {


		//Checking if email already exist
		const user = await User.findOne({ email: req.body.email });

		//If user exists then show error
		if (!user) {
			return res.status(422).json({ error: "User Not Found" });
		}

		else {

			if (req.body.makeadmin) {
				user.isAdmin = true
			}
			else {
				user.isAdmin = false
			}

			await user.save();

			// Sending respose of user created successfully
			res.status(201).json({ message: "User Details Updated successfully" });
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
		console.log(error)
	}
});

module.exports = router;
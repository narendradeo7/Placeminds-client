const router = require("express").Router();
const { User } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
	try {
		//Validating User input data, if all fields are filled or not
		const { error } = validate(req.body);
		//If all fields are not filled
		if (error) {
			return res.status(400).json({ error: "Please Fill the Details" });
		}

		//User not found or Email Invalid
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(400).json({ error: "Invalid Email or Password" });
		}
		//Email Found
		else {
			//Checking Password
			const validPassword = await bcrypt.compare(req.body.password, user.password);

			//Wrong Password
			if (!validPassword) {
				return res.status(400).json({ error: "Invalid Email or Password" });
			}
			//Right Password
			else {
				//Credentials Match and Generating Token
				const token = await user.generateAuthToken();

				//Getting User Data, without password
				const userGetData = {
					name: user.name,
					email: user.email,
					contact: user.contact,
					enrollment: user.enrollment,
				};
				//Sending response with Token and UserData
				res.status(200).send({ data: token, userGetData: userGetData, message: "Logged in successfully" });
			}
		}
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
		console.log(error)
	}
});

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().email().required().label("Email"),
		password: Joi.string().required().label("Password"),
	});
	return schema.validate(data);
};


module.exports = router;
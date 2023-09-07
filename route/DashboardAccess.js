const router = require("express").Router();
const authenticate = require("../middleware/authenticate");



router.get('/', authenticate, (req, res) => {

	if (!req.rootUser) {
		return res.send({ userfound: false })
	}

	res.status(201).send({
		userDatasB: req.rootUser,
		driveData: req.driveDetail
	});


})

module.exports = router

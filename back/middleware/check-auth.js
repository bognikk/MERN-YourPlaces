const jwt = require("jsonwebtoken");
require("dotenv").config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
		if (!token) {
			throw new Error("Authentication failed!");
		}
		const decodedToken = jwt.verify(token, PRIVATE_KEY);
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (err) {
		const error = new HttpError("Authentication failed!", 401);
		return next(error);
	}
};
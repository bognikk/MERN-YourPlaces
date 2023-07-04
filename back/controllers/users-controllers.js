const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
	{
		id: "u1",
		name: "Nikola Bogicevic",
		email: "nbogicevic2@gmail.com",
		password: "testTest",
	},
];

// -------------------------------- GET --------------------------------
const getUsers = (req, res, next) => {
	res.json({ users: DUMMY_USERS });
};

// -------------------------------- SIGNUP --------------------------------
const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { name, email, password, places } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Signing up failed, please try again later.",
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			"User exists already, please login instead.",
			422
		);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMHByb2ZpbGV8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
		password,
		places,
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError("Signing up failed, please try again.", 500);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// -------------------------------- LOGIN --------------------------------
const login = (req, res, next) => {
	const { email, password } = req.body;

	const identifiedUser = DUMMY_USERS.find((u) => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError(
			"Could not identify the user, credentials seem to be wrong.",
			401
		);
	}

	res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

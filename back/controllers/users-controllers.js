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
const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password"); // -password excludes password, could be "email name"
	} catch (err) {
		const error = new HttpError(
			"Fetching users failed, please try again later.",
			500
		);
		return next(error);
	}

	res.json({
		users: users.map((user) => user.toObject({ getters: true })),
	});
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
const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			"Logging in failed, please try again later.",
			500
		);
		return next(error);
	}

	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError(
			"Invalid credentials, could not log you in.",
			401
		);
		return next(error);
	}

	res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;

// const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

// let DUMMY_PLACES = [
// 	{
// 		id: "p1",
// 		title: "Empire State Building",
// 		description: "One of the most famous skyscrapers in the world!",
// 		imageUrl:
// 			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
// 		address: "20 W 34th St, New York, NY 10001",
// 		location: {
// 			lat: 40.7484405,
// 			lng: -73.9878584,
// 		},
// 		creator: "u1",
// 	},
// 	{
// 		id: "p2",
// 		title: "Empire State Building",
// 		description: "One of the most famous skyscrapers in the world!",
// 		imageUrl:
// 			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
// 		address: "20 W 34th St, New York, NY 10001",
// 		location: {
// 			lat: 40.7484405,
// 			lng: -73.9878584,
// 		},
// 		creator: "u2",
// 	},
// ];

// -------------------------------- GET by PLACE id - READ --------------------------------
const getPlaceById = async (req, res, next) => {
	const placeId = req.params.placeId; // {placeId: 'p1'}

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not find a place.",
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError(
			"Could not find a place for the provided id.",
			404
		);
		return next(error);
	}

	res.json({ place: place.toObject({ getters: true }) }); // getters: true returns _id to just id
};

// -------------------------------- GET by USER id - READ --------------------------------
const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.userId;

	let places;
	try {
		places = await Place.find({ creator: userId });
	} catch (err) {
		const error = new HttpError(
			"Fetching places failed, please try again later.",
			500
		);
		return next(error);
	}

	if (!places || places.length === 0) {
		// when using asynchronous code
		return next(
			new HttpError("Could not find places for the provided user id.", 404)
		);
	}

	res.json({
		places: places.map((place) => place.toObject({ getters: true })),
	}); // getters: true returns _id to just id
};

// -------------------------------- POST - CREATE --------------------------------
const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { title, description, address, creator } = req.body; // const title = req.body.title

	let coordinates;

	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	const createdPlace = new Place({
		title,
		description,
		location: coordinates,
		address,
		image: req.file.path,
		creator,
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(
			"Creating place failed, please try again.",
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError("Could not find user for provided id.", 500);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save({ session: sess });
		user.places.push(createdPlace);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			"Creating place failed, please try again.",
			500
		);
		return next(error);
	}

	res.status(201).json({ place: createdPlace });
};

// -------------------------------- PATCH - UPDATE --------------------------------
const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return next(
			new HttpError("Invalid inputs passed, please check your data.", 422)
		);
	}

	const { title, description } = req.body;
	const placeId = req.params.placeId;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not update place.",
			500
		);
		return next(error);
	}

	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError(
			"Updating place failed, something went wrong.",
			500
		);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

// -------------------------------- DELETE - DELETE --------------------------------
const deletePlace = async (req, res, next) => {
	const placeId = req.params.placeId;

	let place;
	try {
		place = await Place.findById(placeId).populate("creator");
	} catch (err) {
		const error = new HttpError(
			"Something went wrong, could not delete a place.",
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError("Could not find place for this id.", 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.deleteOne({ session: sess });
		place.creator.places.pull(place);
		await place.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			"Deleting place failed, something went wrong.",
			500
		);
		return next(error);
	}

	res.status(200).json({ message: "Place deleted." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

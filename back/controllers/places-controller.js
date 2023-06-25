const uuid = require("uuid").v4;
const HttpError = require("../models/htto-error");

const DUMMY_PLACES = [
	{
		id: "p1",
		title: "Empire State Building",
		description: "One of the most famous sky scrapers in the world!",
		imageUrl:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
		address: "20 W 34th St, New York, NY 10001",
		location: {
			lat: 40.7484405,
			lng: -73.9878584,
		},
		creator: "u1",
	},
	{
		id: "p2",
		title: "Empire State Building",
		description: "One of the most famous sky scrapers in the world!",
		imageUrl:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
		address: "20 W 34th St, New York, NY 10001",
		location: {
			lat: 40.7484405,
			lng: -73.9878584,
		},
		creator: "u2",
	},
];

const getPlaceById = (req, res, next) => {
	const placeId = req.params.placeId; // {placeId: 'p1'}
	const place = DUMMY_PLACES.find((p) => {
		return p.id === placeId;
	});

	if (!place) {
		// when using synchronous code
		throw new HttpError("Could not find a place for the provided id.", 404);
	}

	res.json({ place });
};

const getPlaceByUserId = (req, res, next) => {
	const userId = req.params.userId;
	const place = DUMMY_PLACES.find((p) => {
		return p.creator === userId;
	});

	if (!place) {
		// when using asynchronous code
		return next(
			new HttpError("Could not find a place for the provided user id.", 404)
		);
	}

	res.json({ place });
};

const createPlace = (req, res, next) => {
	const { title, description, coordinates, address, creator } = req.body; // const title = req.body.title
	const createdPlace = {
		id: uuid(),
		title,
		description,
		location: coordinates,
		address,
		creator,
	};

	DUMMY_PLACES.push(createdPlace);

	res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;

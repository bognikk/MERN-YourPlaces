const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyDMXSo3HKcn7jD7uV5lZYIoZegS6jEVG78";

async function getCoordsForAddress(address) {
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${API_KEY}`
	);

	const data = response.data;

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError(
			"Could not find location for the specified address.",
			422
		);

		throw error;
	}

	const coordinates = data.results[0].geometry.location;

	console.log([coordinates]);

	return coordinates;
}

module.exports = getCoordsForAddress;

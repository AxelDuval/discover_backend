const axios = require("axios");
const API_KEY = "AIzaSyC_xiukSmEwSQtrspKYOpz_cw2OGpAaQY0";
const HttpError = require("../models/http-error");

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = response.data;
  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Impossible de trouver un lieu avec l'adresse renseignée",
      422
    );
    // throw error;
  }
  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsForAddress;

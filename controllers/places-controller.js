const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const Place = require("../models/place");

let PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description:
      "L'Empire State Building est un gratte-ciel de style Art déco situé dans l'arrondissement de Manhattan, à New York.",
    imageUrl: "https://picsum.photos/500?grayscale",
    address: "34th st, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Empire State Building 2",
    description:
      "L'Empire State Building est un gratte-ciel de style Art déco situé dans l'arrondissement de Manhattan, à New York.",
    imageUrl: "https://picsum.photos/500?grayscale",
    address: "34th st, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];

async function getPlaceById(req, res, next) {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, merci de réessayer",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Pas de lieu trouvé avec cet identifiant", 404);
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, merci de réessayer",
      500
    );
    return next(error);
  }
  if (!places || places.length === 0) {
    return next(new HttpError("Pas de lieu trouvé pour cet utilisateur", 404));
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
}

// CREATE PLACE
async function createPlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Les données saisies sont invalides", 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "https://picsum.photos/500?grayscale",
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "La création du lieu a échoué, merci de réessayer.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
}

// UPDATE PLACE
async function updatePlace(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Les données saisies sont invalides", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, le lieu n'a pas été mis à jour",
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
      "Un problème est survenu, le lieu n'a pas été mis à jour",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
}

// DELETE PLACE
async function deletePlace(req, res, next) {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, le lieu n'a pas été supprimé",
      500
    );
    return next(error);
  }

  try {
    await place.remove();
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, le lieu n'a pas été supprimé",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Le lieu a bien été supprimé" });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

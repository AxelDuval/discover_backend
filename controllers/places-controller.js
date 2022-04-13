const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

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
  let userPlaces;
  try {
    userPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, merci de réessayer",
      500
    );
    return next(error);
  }
  if (!userPlaces || userPlaces.places.length === 0) {
    return next(new HttpError("Pas de lieu trouvé pour cet utilisateur", 404));
  }

  res.json({
    places: userPlaces.places.map((place) => place.toObject({ getters: true })),
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

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "La création du lieu a échoué, merci de réessayer.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Impossible de trouver l'utilisateur avec l'identifiant fourni",
      404
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
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
    return next(new HttpError("Les données saisies sont invalides", 422));
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
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, le lieu n'a pas été supprimé",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Pas de lieu trouvé avec cet identifiant", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
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

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { validationResult } = require("express-validator");
const Place = require("../models/place");
const User = require("../models/user");
const mongoose = require("mongoose");

// CRUD OPERATIONS

// READ

async function getPlaces(req, res, next) {
  let places;
  try {
    places = await Place.find();
  } catch (err) {
    const error = new HttpError(
      "La récupération des lieux a echoué, merci de réessayer",
      500
    );
    return next(error);
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
}

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
    // the populate() method allows to get access to documents stored in different collections
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

  const { title, description, address, creator, image } = req.body;

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
    image,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("La recherche de l'utilisateur a échoué.", 500);
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
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
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

if(place.creator.toString() !== req.userData.userId){
  const error = new HttpError(
    "Vous n'êtes pas autorisé à modifier ce lieu",
    401
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
    console.log(error);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Pas de lieu trouvé avec cet identifiant", 404);
    console.log(error);
    return next(error);
  }

  if(place.creator.id !== req.userData.userId){
    const error = new HttpError(
      "Vous n'êtes pas autorisé à supprimer ce lieu",
      401
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess, validateModifiedOnly: true });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, le lieu n'a pas été supprimé",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Le lieu a bien été supprimé" });
}

exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

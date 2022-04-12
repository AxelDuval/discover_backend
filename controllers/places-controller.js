const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

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

function getPlaceById(req, res, next) {
  const placeId = req.params.pid;

  const place = PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError("Pas de lieu trouvé avec cet identifiant", 404);
  }
  res.json({ place: place });
}

function getPlacesByUserId(req, res, next) {
  const userId = req.params.uid;

  const places = PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(new HttpError("Pas de lieu trouvé pour cet utilisateur", 404));
  }

  res.json({ places: places });
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

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  PLACES.push(createdPlace); //unshift(createdPlace)
  res.status(201).json({ place: createdPlace });
}

// UPDATE PLACE
function updatePlace(req, res, next) {
  const { title, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Les données saisies sont invalides", 422);
  }
  const placeId = req.params.pid;
  const updatedPlace = { ...PLACES.find((p) => p.id === placeId) };
  const placeIndex = PLACES.findIndex((p) => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
}

// DELETE PLACE
function deletePlace(req, res, next) {
  const placeId = req.params.pid;
  if (!PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Aucun lieu trouvé avec cet identifiant");
  }
  PLACES = PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Le lieu a bien été supprimé" });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

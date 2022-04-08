const express = require("express");

const router = express.Router();

const PLACES = [
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

// write a new route able to accept a dynamic uid segment,
// extract it in the middleware function and find a place where the creator has that user ID.

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;

  const place = PLACES.find((p) => {
    return p.id === placeId;
  });

  res.json({ place: place });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;

  const place = PLACES.find((p) => {
    return p.creator === userId;
  });

  res.json({ place: place });
});

module.exports = router;

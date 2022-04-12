const express = require("express");
const router = express.Router();
const placesController = require("../controllers/places-controller");

// write a new route able to accept a dynamic uid segment,
// extract it in the middleware function and find a place where the creator has that user ID.

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", placesController.createPlace);

router.patch("/:pid", placesController.updatePlace);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;

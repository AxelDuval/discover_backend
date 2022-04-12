const express = require("express");
const router = express.Router();
const placesController = require("../controllers/places-controller");
const { check } = require("express-validator");

// write a new route able to accept a dynamic uid segment,
// extract it in the middleware function and find a place where the creator has that user ID.

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("address").not().isEmpty(),
    check("description").isLength({ min: 5 }),
  ],
  placesController.createPlace
);

router.patch("/:pid",
[
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
], placesController.updatePlace);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;

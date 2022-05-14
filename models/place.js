const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");


// Define the schema and the corresponding model

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true, maxlength: 255 },
  description: { type: String, required: true, minlength: 5, maxlength: 2000 },
  image: { type: String, required: true },
  address: { type: String, required: true, maxlength: 600 },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },

  // Connect differents models and schemas with the ref property
  // Add the id of the created place to the corresponding creator.
  creator: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Place", placeSchema);

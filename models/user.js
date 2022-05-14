const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

// Create the schema and the corresponding model

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, maxlength: 40 },
  email: { type: String, required: true, unique: true, maxlength: 60 },
  password: { type: String, required: true, minlength: 6, maxlength: 60 },
  image: { type: String, required: true },
  places: [{ type: Schema.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);

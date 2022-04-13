const HttpError = require("../models/http-error");
const res = require("express/lib/response");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// GET ALL USERS
async function getUsers(req, res, next) {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "La récupération des utilisateurs a echoué, merci de réessayer",
      500
    );
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
}


// SIGNUP (CREATE NEW USER)
async function signUp(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Identifiants invalides", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, merci de réessayer",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "L'utilisateur existe déja, vous pouvez vous identifier",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG.png",
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Erreur lors de la création de l'utilisateur",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
}


// LOGIN (GET AN EXISTING USER)
async function login(req, res, next) {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Un problème est survenu, merci de réessayer",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Les identifiants sont invalides", 401);
    return next(error);
  }

  res.json({ message: "Identifié !" });
}

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

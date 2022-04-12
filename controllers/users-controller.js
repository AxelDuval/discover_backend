const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const res = require("express/lib/response");
const { validationResult } = require("express-validator");


const USERS = [
  {
    id: "u1",
    name: "Axel Duval",
    email: "test@test.fr",
    password: "testers",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: USERS });
};
const signUp = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Les données saisies sont invalides", 422);
  }

  const hasUser = USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("cet email est déja utilisé", 422);
  }
  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };
  USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};
const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Identifiants incorrects", 401);
  }
  res.json({ message: "Identifié !" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

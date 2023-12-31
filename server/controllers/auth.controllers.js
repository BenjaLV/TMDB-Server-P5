import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

export const register = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: passwordHash,
    });

    const userSaved = await newUser.save();
    const token = await createAccessToken({ id: userSaved._id });
    res.cookie("token", token);

    res.json({
      id: userSaved.id,
      email: userSaved.email,
      createAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });

    if (!userFound) return res.status(400).json({ message: "User not Found" });
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = await createAccessToken({ id: userFound._id });
    res.cookie("token", token);

    res.json({
      id: userFound.id,
      username: userFound.username,
      email: userFound.email,
      createAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });

  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  
  const {id} = req.body
  console.log(id);
  const userFound = await User.findById(id);

  if (!userFound) return res.status(400).json({ message: "User not found" });
  console.log('entre acá');
  const userFavorites = userFound.likedMovies; 
  console.log('aca');
  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    createAt: userFound.createAt,
    updatedAt: userFound.updatedAt,
    favorites: userFavorites, 
  });
};
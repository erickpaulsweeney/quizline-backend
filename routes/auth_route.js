const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send({ message: "All fields required." });
    }
    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match." });
    }

    const findEmail = await UserModel.findOne({ email: email });
    if (findEmail !== null) {
        return res.status(400).send({ message: "Email already in use." });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
        name,
        email,
        password: hash,
    });

    try {
        const savedUser = await newUser.save();
        return res
            .status(201)
            .send({ message: "User created with id: " + savedUser.id });
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "All fields required." });
    }

    const findUser = await UserModel.findOne({ email: email });
    if (findUser === null) {
        return res.status(404).send({ message: "User does not exist." });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);
    if (!checkPassword) {
        return res.status(400).send({ message: "Incorrect password." });
    }

    const { id, name, userEmail, templates } = findUser;
    const data = { id, name, email: userEmail, templates };
    const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
    });
    return res.status(200).json({ access_token, refresh_token, data });
});

router.post("/token", async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).send({ message: "Refresh token required." });
    }

    try {
        const payload = await jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET
        );
        delete payload.exp;
        const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).json({ access_token });
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router;

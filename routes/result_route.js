const express = require("express");
const QuizModel = require("../models/quiz");
const ResultModel = require("../models/result");

const router = express.Router();

router.post("/new", async (req, res) => {
    const { creator, quiz, results } = req.body;
    if (!creator || !quiz || !results) {
        return res.status(400).send({ message: "All fields are required." });
    }

    const findQuiz = await QuizModel.findById(quiz);
    if (findQuiz === null) {
        return res.status(400).send({ message: "Invalid quiz ID." });
    }

    const newResult = new ResultModel({
        creator,
        quiz,
        results,
    });

    try {
        const savedResult = await newResult.save();
        return res
            .status(201)
            .send({ message: "Result saved with id: " + savedResult.id });
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    const userId = req.userInfo.id;
    console.log(userId);
    try {
        const list = await ResultModel.find({ creator: userId })
            .populate("quiz", "title subject")
            .populate("results", "name score");
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router;

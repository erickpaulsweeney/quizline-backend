const express = require("express");
const QuizModel = require("../models/quiz");

const router = express.Router();

router.post("/new", async (req, res) => {
    const { title, subject, type, questions } = req.body;
    const creator = req.userInfo.id;
    if (!title || !subject || !type) {
        return res.status(400).send({ message: "Title, subject, and quiz type are required." });
    }
    if (questions.length === 0) {
        return res.status(400).send({ message: "Quiz must contain at least one question." });
    }

    const newQuiz = new QuizModel({
        title, 
        creator,
        subject,
        type,
        questions, 
    });

    try {
        const savedQuiz = await newQuiz.save();
        return res.status(201).send({ message: "Quiz created with id: " + savedQuiz.id });
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    const { id } = req.userInfo;
    try {
        const list = await QuizModel.find({ creator: id })
        .populate("questions");
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.post("/edit/:id", async (req, res) => {
    const quiz = req.body;
    const { id } = req.params;
    const userId = req.userInfo.id;
    const findQuiz = await QuizModel.findById(id);
    if (userId !== findQuiz.creator) {
        return res.status(401).send({ message: "Unauthorized operation." });
    }

    try {
        await QuizModel.findByIdAndUpdate(id, quiz);
        return res.status(200).send({ message: "Quiz successfully updated." });
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router;
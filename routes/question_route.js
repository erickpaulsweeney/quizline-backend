const express = require("express");
const multer = require("multer");
const QuestionModel = require("../models/question");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.post("/new", upload.single("image"), async (req, res) => {
    const { question, correctAnswer } = req.body;
    const rawChoices = JSON.parse(req.body.choices);
    let choices = [];
    for (const index in rawChoices) {
        choices[index] = { text: rawChoices[index], index: index }
    }
    const image =
        "http://localhost:8000/" + req.file?.filename ??
        "http://localhost:8000/1663053537604-default-image";
    const userId = req.userInfo.id;
    if (!question) {
        return res.status(400).send({ message: "Question required." });
    }
    if (choices.length !== 2 && choices.length !== 4) {
        return res.status(400).send({ message: "Number of choices invalid." });
    }
    if (correctAnswer > choices.length) {
        return res.status(400).send({ message: "Correct answer is invalid." });
    }

    const newQuestion = new QuestionModel({
        question,
        image, 
        choices,
        correctAnswer, 
    });
    
    try {
        const savedQuestion = await newQuestion.save();
        return res.status(201).json(savedQuestion);
    } catch (error) {
        console.log(error)
        return res.status(500).send(error);
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await QuestionModel.findByIdAndDelete(id);
        return res.status(200).send({ message: "Question successfully deleted." });
    } catch (error) {
        return res.status(500).send(error);
    }
}); 

module.exports = router;

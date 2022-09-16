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
    const { question, type, correctAnswer } = req.body;
    const rawChoices = JSON.parse(req.body.choices);
    let choices = [];
    for (const index in rawChoices) {
        choices[index] = { text: rawChoices[index], index: index }
    }
    const image =
        req.file?.filename ?
        "http://localhost:8000/" + req.file.filename :
        "http://localhost:8000/1663053537604-default-image.png";
    const userId = req.userInfo.id;
    if (!question) {
        return res.status(400).send({ message: "Question required." });
    }
    if (!type) {
        return res.status(400).send({ message: "Quiz type required." });
    }
    if ((type === "Multiple Choices" && choices.length !== 4) || (type === "True or False" && choices.length !== 2)) {
        return res.status(400).send({ message: "Number of choices invalid." });
    }
    if (correctAnswer > choices.length) {
        return res.status(400).send({ message: "Correct answer is invalid." });
    }

    const newQuestion = new QuestionModel({
        question,
        image, 
        type,
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

router.post("/:id", upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const rawChoices = JSON.parse(req.body.choices);
    let choices = [];
    for (const index in rawChoices) {
        choices[index] = { text: rawChoices[index], index: index }
    }
    req.body.choices = choices;
    try {
        await QuestionModel.findByIdAndUpdate(id, req.body);
        const editedQuestion = await QuestionModel.findById(id);
        return res.status(200).json(editedQuestion);
    } catch (error) {
        return res.status(500).send({ error: error });
    }
}); 

module.exports = router;

const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
    {
        question: {
            type: String,
            require: true,
        },
        image: {
            type: String,
        },
        type: {
            type: String,
            require: true,
        },
        choices: [
            mongoose.Schema({
                text: {
                    type: String,
                    require: true,
                },
                index: {
                    type: Number,
                    require: true,
                },
            }),
        ],
        correctAnswer: {
            type: Number,
            require: true,
        },
    },
    { timestamps: true }
);

const QuestionModel = mongoose.model("QuizQuestions", questionSchema);
module.exports = QuestionModel;

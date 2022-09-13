const mongoose = require("mongoose");

const quizSchema = mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
        },
        creator: {
            type: String,
            require: true,
            ref: "QuizUsers",
        },
        subject: {
            type: String,
            require: true,
        },
        type: {
            type: String,
            require: true,
        },
        questions: [
            {
                type: String,
                ref: "QuizQuestions",
            },
        ],
    },
    { timestamps: true }
);

const QuizModel = mongoose.model("Quizzes", quizSchema);
module.exports = QuizModel;

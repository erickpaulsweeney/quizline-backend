const mongoose = require("mongoose");

const resultSchema = mongoose.Schema({
    creator: {
        type: String,
        ref: "QuizUsers",
        require: true,
    }, 
    quiz: {
        type: String,
        ref: "Quizzes",
        require: true, 
    }, 
    results: [
        mongoose.Schema({
            name: {
                type: String,
                require: true,
            }, 
            score: {
                type: Number,
                require: true,
            },
        })
    ]
}, { timestamps: true });

const ResultModel = mongoose.model("QuizResults", resultSchema);
module.exports = ResultModel;

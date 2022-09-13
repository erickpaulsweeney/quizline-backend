const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
        },
        templates: [
            {
                type: String,
                ref: "Quizzes",
            },
        ],
    },
    { timestamps: true }
);

const UserModel = mongoose.model("QuizUsers", userSchema);
module.exports = UserModel;

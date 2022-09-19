// Imports
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoute = require("./routes/auth_route");
const questionRoute = require("./routes/question_route");
const quizRoute = require("./routes/quiz_route");
const resultRoute = require("./routes/result_route");

// Server setup
const app = express();

const httpServer = app.listen(process.env.PORT || 8000, () => {
    console.log("Server connected");
});

// Database connection
const DB_URI =
    "mongodb+srv://erick_paul:test1234@cluster0.bhdvtow.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

// Middlewares
app.use(cors());
app.use(express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoute);
app.use(authenticateRequest);
app.use("/question", questionRoute);
app.use("/quiz", quizRoute);
app.use("/result", resultRoute);

function authenticateRequest(req, res, next) {
    const authHeaderInfo = req.headers["authorization"];
    if (!authHeaderInfo) {
        return res.status(400).send({ message: "No token provided." });
    }

    const token = authHeaderInfo.split(" ")[1];
    if (!token) {
        return res.status(400).send({ message: "No proper token provided." });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userInfo = payload;
        next();
    } catch (error) {
        return res.status(403).send(error);
    }
}

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    },
});

let rooms = {};

io.on("connection", (socket) => {
    socket.on("create-room", (pin) => {
        rooms[pin] = {
            creator: socket.id,
            started: false,
            users: [],
        };
        socket.join(pin);
    });

    socket.on("enter-pin", (input) => {
        if (Object.keys(rooms).includes(input)) {
            if (rooms[input].started) {
                io.to(socket.id).emit("already-started");
            } else {
                io.to(socket.id).emit("ask-name", input);
            }
        } else {
            io.to(socket.id).emit("wrong-pin");
        }
    });

    socket.on("send-name", ({ roomPin, name }) => {
        if (rooms[roomPin].users.map(user => user.name).includes(name)) {
            io.to(socket.id).emit("name-taken");
            return;
        }
        const pin = roomPin;
        const userObj = {
            id: socket.id,
            name: name,
            answers: [],
            score: 0,
        };
        socket.join(pin);
        rooms[pin].users = rooms[pin].users.concat(userObj);
        io.to(rooms[pin].creator).emit("new-user", rooms[pin].users);
        io.to(socket.id).emit("entered", socket.id);
    });

    socket.on("start-signal", (pin) => {
        rooms[pin].started = true;
        socket.to(pin).emit("start-game");
    });

    socket.on("share-details", ({ quiz, pin }) => {
        socket.to(pin).emit("give-data", quiz);
    });

    socket.on("get-data", (pin) => {
        io.to(socket.id).emit("update-data", rooms[pin]);
    });

    socket.on("answer", ({ roomPin, input, check }) => {
        rooms[roomPin].users.forEach(user => {
            if (user.id === socket.id) {
                user.answers = user.answers.concat(input);
                if (check) {
                    user.score += 1;
                }
            }
        });
        io.to(rooms[roomPin].creator).emit("update-data", rooms[roomPin]);
    });

    socket.on("time-end", (pin) => {
        io.to(pin).emit("time-end");
    });

    socket.on("next-question", ({ pin, curr }) => {
        io.to(pin).emit("next-question", curr);
    });

    socket.on("game-done", (pin) => {
        io.to(pin).emit("game-done", rooms[pin]);
    });

    socket.on("results", ({ pin, chartData }) => {
        rooms[pin].chartData = chartData;
        io.to(pin).emit("top-three", chartData);
    });
});

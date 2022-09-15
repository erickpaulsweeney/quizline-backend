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

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    },
});

let rooms = {};

io.on("connection", (socket) => {
    socket.on("create-room", ({ roomLink, pin }) => {
        rooms[roomLink] = { pin: pin };
        rooms[roomLink].creator = socket.id;
        socket.join(roomLink);
    });

    socket.on("enter-pin", ({ roomLink, input }) => {
        if (rooms[roomLink].pin === input) {
            io.to(socket.id).emit("ask-name");
        } else {
            io.to(socket.id).emit("wrong-pin");
        }
    });

    socket.on("send-name", ({ roomLink, name }) => {
        console.log(name);
        const userObj = {
            id: socket.id,
            name: name,
            answers: [],
        };
        if (!rooms[roomLink].hasOwnProperty("users")) {
            rooms[roomLink].users = [userObj];
            io.to(rooms[roomLink].creator).emit(
                "new-user",
                rooms[roomLink].users
            );
        } else {
            rooms[roomLink].users = rooms[roomLink].users.concat(userObj);
            io.to(rooms[roomLink].creator).emit(
                "new-user",
                rooms[roomLink].users
            );
        }
        io.to(socket.id).emit("entered");
    });

    socket.on("start-signal", ({ roomLink }) => {
        socket.to(roomLink).emit("start-game");
    });
});

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

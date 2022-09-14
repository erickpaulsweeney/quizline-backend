// Imports
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ExpressPeerServer } = require("peer");
require("dotenv").config();

const authRoute = require("./routes/auth_route");
const questionRoute = require("./routes/question_route");
const quizRoute = require("./routes/quiz_route");

// Server setup
const app = express();

const httpServer = app.listen(process.env.PORT || 8000, () => {
    console.log("Server connected");
});

// const peerServer = ExpressPeerServer(httpServer, {
//     debug: true,
// });

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
// app.use("/peerjs", peerServer);
app.use("/auth", authRoute);
app.use(authenticateRequest);
app.use("/question", questionRoute);
app.use("/quiz", quizRoute);


// peerServer.on("connection", (peer) => {
//     console.log("Peer connected " + peer.id);
// });

// peerServer.on("disconnect", (peer) => {
//     console.log("Peer disconnected " + peer.id);
// });

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    }
});

io.on("connection", (socket) => {
    console.log("Client connected " + socket.id);
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        io.to()
    })
})

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
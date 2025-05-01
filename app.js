const cors = require("cors");
const express = require("express");
const app = express();
const { getEndPoints } = require("./controllers/endPoints.controller");

const usersRouter = require("./routes/users.router");
const eventsRouter = require("./routes/events.router");



app.use(cors());
app.use(express.json());

app.get("/api", getEndPoints);
app.use("/api/users", usersRouter);
app.use("/api/events", eventsRouter);

app.all("{*any}", (req, res) => {
    res.status(404).send({ msg: "404: Not Found" });
});

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg });
    } else if (err.code === "22P02" || err.code === "23502") {
        res.status(400).send({ msg: "400: Bad Request" });
    } else if (err.code === "23503") {
        res.status(404).send({ msg: "404: Event or User Not Found" });
    } else {
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

module.exports = app;

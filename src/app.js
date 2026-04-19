//initate the server & create instance of server and use api route here
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

//require all the routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")

//using all the routes here
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/interview", interviewRouter)

module.exports = app;

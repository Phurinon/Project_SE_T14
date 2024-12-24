const express = require("express");
const app = express();
const morgan = require("morgan");
const { readdirSync } = require("fs");
const cors = require("cors");

//Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

readdirSync("./routes").map((item) =>
  app.use("/api", require("./routes/" + item))
);
//Router
// app.post("/api", (req, res) => {
//   console.log(req.body.email);
//   res.send("Hello api");
// });

//Start server
app.listen(3000, () => console.log("Server is running on port 3000"));

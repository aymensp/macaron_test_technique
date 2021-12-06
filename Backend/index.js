const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());
var usersRouter = require("./routes/api");

app.use(express.json());
app.use("/get", usersRouter);

app.listen(9000, () => {
  console.log("SERVER Is Up On 3000");
});

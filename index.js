const express = require("express");
const mainRouter = require("./routes/index");
const cors = require("cors");
const app = express();
const port = 8090;

app.use(cors());
app.use(express.json());
app.use("/api/v1", mainRouter);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

// app.use((err, req, res, next) => {
//   if (err) {
//     res.json({
//       Error: "Something went wrong. Please try again after some time",
//     });
//   }
// });

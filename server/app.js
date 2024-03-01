const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");
require("dotenv").config();
const upload = require("express-fileupload");

const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoute");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const exp = require("constants");

const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({ credentials: true, origin: "http://localhost:4173/" }));
app.use(upload());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_URI)
  .then(
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server Started on Port ${process.env.PORT} And Data base is Active`
      );
    })
  )
  .catch((error) => console.log(error));

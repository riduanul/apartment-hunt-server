const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const fileUpload = require("express-fileupload");

const app = express();
// request parsers
app.use(express.json());

app.use(cors());
app.use(express.static("uploads"));
app.use(fileUpload());
dotenv.config();

app.get("/", (req, res) => {
  res.send("i am working");
});

//middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
});

// // database connection
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.4xssl.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  keepAlive: 1,
});

client.connect((err) => {
  console.log("Database connection errors:", err);
  const bookingCollection = client
    .db("apartmentdb")
    .collection("bookingRequest");

  const apartmentCollection = client
    .db("apartmentdb")
    .collection("apartmentInfo");

  const adminCollection = client.db("apartmentdb").collection("admin");

  app.post("/booking", (req, res) => {
    const bookingInfo = req.body;
    console.log(bookingInfo);
    bookingCollection.insertOne(bookingInfo).then((result) => {
      if (result > 0) {
        res.status(200).send(result);
      }
      res.status(503).send("somthing is wrong");
    });
  });

  app.get("/bookings", (req, res) => {
    bookingCollection.find({}).toArray((err, result) => {
      if (err) {
        res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  });

  app.post("/booking", (req, res) => {
    const email = req.body;
    bookingCollection.find({ email: email }).toArray((err, result) => {
      if (err) {
        res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  });

  app.get("/apartment", (req, res) => {
    apartmentCollection.find({}).toArray((error, result) => {
      if (error) {
        res.status(500).send(error);
      }
      res.status(200).send(result);
    });
  });

  //expres upload form data with file upload

  app.post("/newApartment", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const price = req.body.price;
    const bathroom = req.body.bathroom;
    const bedroom = req.body.bedroom;
    const priceDetails = req.body.priceDetails;
    const propertyDetails = req.body.propertyDetails;

    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const img = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    apartmentCollection
      .insertOne({
        img,
        title,
        price,
        bathroom,
        bedroom,
        priceDetails,
        propertyDetails,
      })
      .then((result) => {
        if (result > 0) {
          res.status(200).send(result);
        }
        res.status(500).send("something is wrong while uploading");
      });
  });

  app.post("/admin", (req, res) => {
    const admin = req.body;
    const name = admin.name;
    const email = admin.email;

    adminCollection.insertOne(name, email).then((result) => {
      if (result > 0) {
        res.status(200).send(result);
      } else {
        res.status(500).send("Something is wrong");
      }
    });
  });

  console.log("database connected");
});

//app listener

app.listen(`${process.env.PORT}`, () => {
  console.log(`listening from port 5000`);
});

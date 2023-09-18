require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
var cors = require("cors");
const {
  getAllRecords,
  createTable,
  appendRecord,
  deleteTable,
} = require("./dbConnector");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4173");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://offline-inspections-client.vercel.app"
  );
  // res.setHeader(
  //   "Access-Control-Allow-Origin",
  //   "https://clientdev.clean-really-bullfrog.ngrok-free.app"
  // );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
const router = express.Router();
router.get("/", (req, res) => {
  console.log("Server Pinged");
  res.send("Hello World");
});
router.get("/test", (req, res) => {
  res.send("Express router working");
});
router.post("/", (req, res) => {
  console.log("server pinged with POST");
  res.send("Hello world again, but with a post request");
});
router.post("/initDb", async (req, res) => {
  console.log("Initializing DB");
  let created = await createTable();
  if (created) {
    res.send("DB initialized");
  } else {
    res.send("DB initialization failed");
  }
});
router.post("/deleteDb", async (req, res) => {
  console.log("deleting DB");
  let deleted = await deleteTable();
  if (deleted) {
    res.send("DB deleted");
  } else {
    res.send("DB deletion failed");
  }
});
router.post("/photos", async (req, res) => {
  console.log("posting photos");
  let errors = [];
  let result = {};
  const posts = req.body.posts;
  console.log(`POST /photos ${posts.length} posts`);
  if (!posts) {
    res.status(500).send({ message: "no posts" });
    return;
  }
  posts.forEach(async (post) => {
    try {
      let cloudinaryUrl = await cloudinary.uploader.upload(post.photo.encoded);
      if (!!cloudinaryUrl) {
        const data = {
          id: post.id,
          caption: post.caption,
          createdAt: post.createdAt,
          uploadedAt: new Date(),
          imageUrl: cloudinaryUrl.secure_url,
          imageAlt: post.photo.name,
        };

        let uploaded = await appendRecord(data);
        if (uploaded) {
          console.log("uploaded record successfully");
          result = {
            ...data,
          };
        }
      }
    } catch (error) {
      console.log(error);
      errors.push(error);
    }
  });

  if (errors.length > 0) {
    res.status(500).send({
      message: "Cloudinary failure",
      errors,
    });
  } else {
    res.status(200).send({
      message: "success",
      result,
    });
  }
});

router.get("/photos", async (req, res) => {
  // todo: get all photos from database
  let db = await getAllRecords();
  console.log(db);
  // let result = JSON.parse(db);
  res.json(db);
});
router.get("/*", async (req, res) => {
  res.send(req.body, req.headers, req);
});
app.use(router);
app.listen(8003);
console.log("App started");

require("dotenv").config();
const express = require("express");
const fs = require("fs/promises");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
var cors = require("cors");
const { appendToDB, readDB } = require("./controllers");

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
    "https://offline-inspections-client.vercel.app/**"
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
  res.send("Hello world again");
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
          imageUrl: cloudinaryUrl.secure_url,
          imageAlt: post.photo.name,
        };

        let result = await appendToDB(data);
        if (result === "success") {
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
  let db = await readDB();
  let result = JSON.parse(db);
  res.json(result);
});
router.get("/*", async (req, res) => {
  res.send(req.body, req.headers, req);
});
app.use(router);
app.listen(8001);
console.log("App started");

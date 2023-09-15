require("dotenv").config();
const express = require("express");
const fs = require("fs/promises");
const { createWriteStream } = require("fs");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
var cors = require("cors");

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
async function readDB() {
  try {
    return await fs.readFile("./db.json");
  } catch (e) {
    console.log(e);
  }
}
async function appendToDB(newData) {
  let currentDBState = await readDB(); // returns json string
  let result = JSON.parse(currentDBState); // parse db state as an obj[]
  result = [newData, ...result]; // push the new record to the list
  currentDBState = JSON.stringify(result); // convert back to json
  var writeStream = createWriteStream("db.json");
  writeStream.write(currentDBState); // write new data
  writeStream.end();
  return "success";
}

app.get("/", (req, res) => {
  console.log("Server Pinged");
  res.send("Hello World");
});
app.post("/", (req, res) => {
  console.log("server pinged with POST");
  res.send("Hello world again");
});
app.post("/photos", async (req, res) => {
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

app.get("/photos", async (req, res) => {
  // todo: get all photos from database
  let db = await readDB();
  let result = JSON.parse(db);
  res.json(result);
});
app.get("/*", async (req, res) => {
  res.send(req.body, req.headers, req);
});

app.listen(8001);
console.log("App started");

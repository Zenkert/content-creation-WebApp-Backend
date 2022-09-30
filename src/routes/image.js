const express = require("express");
const multer = require('multer')
var fs = require('fs');
const path = require('path')
const router = express.Router();
const Image = require('../models/image')
const upload = require('../middleware/mongo-gridFS-middleware')
const dbConfig = require("../config/db");
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const url = dbConfig.url;
const baseUrl = "http://localhost:5000/api/image/files/";
const mongoClient = new MongoClient(url);
const { UserData } = require('../models/image')
const usrtd = require('../middleware/mongo-gridFS-middleware')
// const url = require('url')

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ storage: storage });

// // Post image to db in base64 coding
// router.post("/upload/:userId", upload.single('file'), (req, res) => {
//     var img = fs.readFileSync(req.file.path);
//     var encode_img = img.toString('base64');
//     var final_img = {
//         userId: req.params.userId,
//         contentType: req.file.mimetype,
//         image: new Buffer(encode_img, 'base64')
//     };
//     Image.create(final_img, function (err, result) {
//         if (err) {
//             console.log(err);
//         } else {
//             // console.log(result.img.Buffer);
//             // console.log(encode_img)
//             console.log("Saved To database");
//             res.contentType(final_img.contentType);
//             res.send(final_img.image);
//         }
//     })
// })

// router.get("/getImage", async (req, res) => {
//     try {
//         let url_parts = url.parse(req.url, true);
//         let query = url_parts.query;
//         console.log(query)
//         const path = "uploads/" + "/" + 'db.png';
//         fs.readFile(path, function (err, data) {
//             if (err) throw err; // Fail if the file can't be read.
//             res.writeHead(200);
//             res.status(200).end(data); // Send the file data to the browser.
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });


const uploadFiles = async (req, res, userId) => {
  try {
    await upload(req, res);
    console.log(req.file);
    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }
    return res.send({
      message: "File has been uploaded.",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(dbConfig.database);
    const images = database.collection(`${dbConfig.imgBucket}.files`);
    const cursor = images.find({});
    if ((await cursor.count()) === 0) {
      return res.status(404).send({
        message: "No files found!",
      });
    }
    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });
    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const getListFile = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(dbConfig.database);
    const images = database.collection(`${dbConfig.imgBucket}.files`);
    const files = images.find({ filename: req.params.filename });
    if ((await files.count()) === 0) {
      return res.status(404).send({
        message: "No files found!",
      });
    }
    // create read stream
    var readstream = files.createReadStream({
      file: files[0].file,
      // root: "ctFiles"
    });
    return readstream.pipe(res);

  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const getFilesByName = async (req, res) => {
  try {
    await mongoClient.connect();
    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });
    let readStream = bucket.openDownloadStreamByName(req.params.name);
    readStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot get the Image!" });
    });
    return readStream.pipe(res);

  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};




router.post('/upload/:id', uploadFiles);
router.get('/files', getListFiles)
router.get("/files/:name", getFilesByName);
// router.get("/files/:filename", getListFile);


module.exports = router;
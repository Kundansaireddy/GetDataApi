const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const port = 8080;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const convertDriveLink = (link) => {
  const regex = /\/file\/d\/(.+?)\/view/;
  const match = regex.exec(link);

  if (match && match[1]) {
    const fileId = match[1];
    const convertedLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return convertedLink;
  }

  return link;
};

const subjectSchema = new mongoose.Schema({
  subject: String,
  name: String,
  link: String,
});
const dbURI =
  "mongodb+srv://KSR:160120748032@cluster0.8hmqm9g.mongodb.net/Clicked";
const Subject = mongoose.model("Subject", subjectSchema);
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {})
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

app.get("/api/data", (req, res) => {
  Subject.find()
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error retrieving data from the database:", error);
      res.sendStatus(500);
    });
});

app.post("/api/:subject/store", (req, res) => {
  const { subject } = req.params;
  const { name, link } = req.body;
  const newlink = convertDriveLink(link);
  const newSubject = new Subject({
    subject: subject,
    name: name,
    link: newlink,
  });
  newSubject
    .save()
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error saving data to the database:", error);
      res.sendStatus(500);
    });
});

app.delete("/api/:subject/delete", (req, res) => {
  const { subject } = req.params;
  const { name, link } = req.body;

  Subject.deleteMany({ subject, name, link })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error deleting data from the database:", error);
      res.sendStatus(500);
    });
});

app.listen(port);

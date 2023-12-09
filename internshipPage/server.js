const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect(
    "mongodb+srv://jennastover810:vigmMrzL5iGkqDeU@clusterassignment17.ydj7558.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const internshipSchema = new mongoose.Schema({
  name: String,
  link: String,
  location: String,
  deadline: String,
  img: String,
});

const Internship = mongoose.model("Internship", internshipSchema);

app.get("/api/internships", (req, res) => {
  getInternships(res);
});

const getInternships = async (res) => {
  const internships = await Internship.find();
  res.send(internships);
};

app.post("/api/internships", upload.single("img"), (req, res) => {
  const result = validateInternship(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  const internship = new Internship({
    name: req.body.name,
    link: req.body.link,
    location: req.body.location,
    deadline: req.body.deadline,
  });

  if (req.file) {
    internship.img = "images/" + req.file.filename;
  }

  createInternship(internship, res);
});

const createInternship = async (internship, res) => {
  const result = await internship.save();
  res.send(internship);
};

app.put("/api/internships/:id", upload.single("img"), (req, res) => {
  const result = validateInternship(req.body);

  if (result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
  }

  updateInternship(req, res);
});

const updateInternship = async (req, res) => {
  let fieldsToUpdate = {
    name: req.body.name,
    link: req.body.link,
    location: req.body.location,
    deadline: req.body.deadline,
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  const result = await Internship.updateOne({ _id: req.params.id }, fieldsToUpdate);
  const internship = await Internship.findById(req.params.id);
  res.send(internship);
};

app.delete("/api/internships/:id", upload.single("img"), (req, res) => {
  removeInternship(res, req.params.id);
});

const removeInternship = async (res, id) => {
  const internship = await Internship.findByIdAndDelete(id);
  res.send(internship);
};

const validateInternship = (internship) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    name: Joi.string().min(3).required(),
    link: Joi.string().min(3).required(),
    location: Joi.allow(""),
    deadline: Joi.allow(""),
  });

  return schema.validate(internship);
};

app.listen(3010, () => {
  console.log("I'm listening");
});
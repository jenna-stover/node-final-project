const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const upload = multer({ dest: path.join(__dirname, "public", "images") });
const MONGODB_URI = "mongodb+srv://jennastover810:vigmMrzL5iGkqDeU@clusterassignment17.ydj7558.mongodb.net/internships?retryWrites=true&w=majority&appName=ClusterAssignment17";
const PORT = 3000;

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect to mongodb...", err));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const internshipSchema = new mongoose.Schema({
  name: String,
  company: String,
  link: String,
  location: String,
  deadline: String,
  img: String,
  completed: { type: Boolean, default: false },
});

const Internship = mongoose.model("Internship", internshipSchema);

//fetch all internships
app.get("/api/internships", async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships);
  } catch (error) {
    console.error("Error fetching internships:", error);
    res.status(500).json("Error fetching internships");
  }
});

//create new internship
app.post("/api/internships", upload.single('img'), async (req, res) => {
  console.log("Received data for new internship:", req.body);
  const result = validateInternship(req.body);

  if (result.error) {
    res.status(400).json(result.error.details[0].message);
    return;
  }

  let internship = new Internship({
    name: req.body.name,
    company: req.body.company,
    link: req.body.link,
    location: req.body.location,
    deadline: req.body.deadline,
  });

  if (req.file) {
    internship.img = "/images/" + req.file.filename;
  }

  try {
    internship = await internship.save();
    res.json(internship);
  } catch (error) {
    console.error("Error creating internship:", err);
    res.status(500).json({ error: "Error creating internship" });
  }
});

//update existing internship
app.put("/api/internships/:id", upload.single("img"), async (req, res) => {
  console.log("Received data for updating internship:", req.body);
  
  const { error } = validateInternship(req.body);

  if (error) {
    res.status(400).json(error.details[0].message);
    return;
  }

  let fieldsToUpdate = {
    name: req.body.name,
    company: req.body.company,
    link: req.body.link,
    location: req.body.location,
    deadline: req.body.deadline,
    completed: req.body.completed,
  };

  if (req.file) {
    fieldsToUpdate.img = "images/" + req.file.filename;
  }

  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true }
    );

    if (!internship) {
      return res.status(404).json("Internship not found");
    }

    res.json(internship);
  } catch (error) {
    res.status(500).json("Error updating internship");
  }
});

app.put("/api/internships/:id/completed", async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json("Internship not found");
    }

    res.json(internship);
  } catch (error) {
    res.status(500).json("Error updating internship status");
  }
});

//delete an existing internship
app.delete("/api/internships/:id", async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    console.log("deleted internship");

    if(!internship) {
      return res.status(404).json("Internship not found");
    }

    res.json(internship);
  } catch (error) {
    res.status(500).json("Error deleting internship");
  }
});

//validate internship data
const validateInternship = (internship) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    name: Joi.string().min(3).required(),
    company: Joi.string().min(2).required(),
    link: Joi.string().min(3).required(),
    location: Joi.allow(""),
    deadline: Joi.allow(""),
  });

  return schema.validate(internship);
};

app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`); 
});
// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmerdb')
.then(() => {
  console.log('MongoDB connected');
});

// Create model
const loginSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  name: {
    type: String,
    required: true
  },
  pass: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['farmer', 'customer', 'admin']
  }
}, { collection: 'login' });

const Login = mongoose.model('Login', loginSchema);



// API to check login
app.post('/login', async (req, res) => {
  const { name, pass } = req.body;

  try {
    const user = await Login.findOne({ name, pass });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role === 'farmer') {
      return res.json({ message: 'success', role: user.role,_id: user._id, name: user.name });
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// farmers.js
const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  img: { type: String }
}, { collection: 'farmers' });

const FarmerList = mongoose.model('FarmerList', farmerSchema);

app.put('/farmers/:id', async (req, res) => {
  try {
    console.log("Update request ID:", req.params.id);
    console.log("Update request body:", req.body);

    const { name, location, district, img } = req.body;

    const updatedFarmer = await FarmerList.findByIdAndUpdate(
      req.params.id,
      { name, location, district, img },
      { new: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(updatedFarmer);
  } catch (error) {
    console.error("Error updating farmer:", error);
    res.status(500).json({ error: "Failed to update farmer" });
  }
});



// Start server
app.listen(5001, () => {
  console.log('Server running on port 5001');
});

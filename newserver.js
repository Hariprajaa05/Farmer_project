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
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// --- Models ---

// Login Schema and Model
const loginSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
  name: { type: String, required: true },
  pass: { type: Number, required: true },
  role: { type: String, required: true, enum: ['farmer', 'customer', 'admin'] }
}, { collection: 'login' });
const Login = mongoose.model('Login', loginSchema);

// Farmer Schema and Model
const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
  img: { type: String }
}, { collection: 'farmers' });
const FarmerList = mongoose.model('FarmerList', farmerSchema);

// FarmerProduct Schema and Model
const farmerProductSchema = new mongoose.Schema({
  farmer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmerList', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true }, // Ensure this is unique if used
  price: { type: Number, required: true },
  image: { type: String },
  product_details: {
    name: { type: String, required: true },
    category: { type: String, required: true }
  }
}, { collection: 'farmer_products' });
const FarmerProduct = mongoose.model('FarmerProduct', farmerProductSchema);


// --- API Routes ---

// API to check login
app.post('/login', async (req, res) => {
  const { name, pass } = req.body;
  try {
    const user = await Login.findOne({ name, pass });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.role === 'farmer' || user.role === 'customer' || user.role === 'user') {
      return res.json({ message: 'success', role: user.role, _id: user._id, name: user.name });
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API to handle farmer profile updates
app.put('/farmers/:id', async (req, res) => {
  try {
    console.log("Update farmer profile request ID:", req.params.id);
    console.log("Update farmer profile request body:", req.body);
    const { name, location, district, img } = req.body;
    const updatedFarmer = await FarmerList.findByIdAndUpdate(
      req.params.id,
      { name, location, district, img },
      { new: true } // Returns the modified document rather than the original
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

// API to handle individual farmer product updates
app.put('/farmer_products/:id', async (req, res) => {
  try {
    console.log("Update product request ID:", req.params.id);
    console.log("Update product request body:", req.body);
    const { price, image, product_details } = req.body;

    const updatedProduct = await FarmerProduct.findByIdAndUpdate(
      req.params.id,
      { price, image, product_details },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// API for signup
app.post('/signup', async (req, res) => {
  const { name, pass } = req.body;
  try {
    const newUser = await Login.create({ name: name, pass: Number(pass), role: 'customer' });
    res.status(201).json({ message: "Signup successful", userId: newUser._id });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Start server
app.listen(5001, () => {
  console.log('Server running on port 5001');
});

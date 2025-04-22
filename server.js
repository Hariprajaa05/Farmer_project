//1 step nodejs + express
import express from "express"; //nodejs + express easier to write code than writing only with node js
import mongoose from "mongoose"; // for communicating with mongodb 
import cors from "cors" // enabling cross orgin resource sharing ie communicating between server(node) and react from different ports 

const app = express();
app.use(cors());
app.use(express.json());

//2 step: connecting with farmerdb (MongoDB)
mongoose.connect("mongodb://localhost:27017/farmerdb");
console.log("Connected with mongodb");

//3rd step defining the structure of the scheme
const farmerProductSchema = new mongoose.Schema({
  farmer_id: mongoose.Types.ObjectId, //a MongoDB ID that points to a farmer
  product_id: mongoose.Types.ObjectId,
  price: Number,
  image: String,
});

//4th step connecting both schema structure and the farmer_product collection and making that as a model
const FarmerProduct = mongoose.model("farmer_products", farmerProductSchema);

//5th step getting all details from farmer_products
app.get("/farmer_products", async (req, res) => {
  try {
    const products = await FarmerProduct.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product_details",
        },
      },
      { $unwind: "$product_details" },
      {
        $lookup: {
          from: "farmers",
          localField: "farmer_id",
          foreignField: "_id",
          as: "farmer_details",
        },
      },
      { $unwind: "$farmer_details" },
    ]);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching joined products and farmers");
  }
});

//another example 
const farmerlists = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  location: String,
  district: String,
  img: String,
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "products"
  }],
});
const FarmerList = mongoose.model("farmers", farmerlists); // use the schema
app.get("/farmers", async (req, res) => {
  try {
    const data = await FarmerList.find(); // fetch all farmers
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching farmers");
  }
});

// Example: server.js or farmers.js
app.get("/farmers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const farmer = await FarmerList.findById(id);
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });
    res.json(farmer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const fundingRequestSchema = new mongoose.Schema({
  farmer_id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount_needed: {
    type: Number,
    required: true,
  },
  amount_raised: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Open", "Closed"], // Capitalized as per your format
    default: "Open",
  },
});

const donationSchema = new mongoose.Schema({
  funding_request_id: {
    type: String,
    required: true,
  },
  donor_name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  donated_at: {
    type: Date,
    default: Date.now,
  },
});

const FundingRequest = mongoose.model("funding_requests", fundingRequestSchema);
const Donation = mongoose.model("donations", donationSchema);

// Step 3: GET all funding requests for a specific farmer
app.get("/funding-requests/:farmerId", async (req, res) => {
  const { farmerId } = req.params;
  try {
    const requests = await FundingRequest.find({ farmer_id: farmerId });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching funding requests" });
  }
});

// Step 4: POST a donation
app.post("/donations", async (req, res) => {
  const { funding_request_id, donor_name, amount } = req.body;

  try {
    const donation = new Donation({
      funding_request_id,
      donor_name,
      amount,
    });
    await donation.save();

    const request = await FundingRequest.findById(funding_request_id);
    if (!request) return res.status(404).json({ error: "Funding request not found" });

    request.amount_raised += amount;

    // Close the request if goal is met
    if (request.amount_raised >= request.amount_needed) {
      request.status = "Closed";
    }

    await request.save();

    res.status(200).json({ message: "Donation successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Donation failed" });
  }
});
// Seasonal Crops Schema & Route
const seasonalSchema = new mongoose.Schema({
  farmer_id: mongoose.Types.ObjectId,
  product_name: String,
  image: String,
  price: Number,
  month: String,
});

const SeasonalCrop = mongoose.model("seasonal", seasonalSchema, "seasonal");

app.get("/seasonalcrops", async (req, res) => {
  try {
    const crops = await SeasonalCrop.aggregate([
      {
        $lookup: {
          from: "farmers",  // this is correct
          localField: "farmer_id",
          foreignField: "_id",
          as: "farmer_details",
        },
      },
      { $unwind: "$farmer_details" },
    ]);
    console.log("Crops with lookup 👉", crops); // Debugging log to see the output
    res.json(crops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching seasonal crops" });
  }
});

//6 run it
app.listen(5000, () => {
  console.log("Server running at port http://localhost:5000");
});
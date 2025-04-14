//1 step nodejs + express
import express from "express"; //nodejs + express easier to write code than writing only with node js
import mongoose from "mongoose"; // for communicating with mongodb 
import cors from "cors" // enabling cross orgin resource sharing ie communicating between server(node) and react from different ports 


const app=express();
app.use(cors());
app.use(express.json());

//2 step  : connecting with farmerdb 
mongoose.connect("mongodb://localhost:27017/farmerdb");
console.log("Connected with mongodb");

//3rd step defining the structure of the scheme
const farmerProductSchema=new mongoose.Schema({
    farmer_id: mongoose.Types.ObjectId, //a MongoDB ID that points to a farmer
    product_id: mongoose.Types.ObjectId,
    price: Number,
    image: String,
});



//4th step connecting both schema structure and the farmer_product collection and making that as a model
const FarmerProduct=mongoose.model("farmer_products",farmerProductSchema);

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
const farmerlists=new mongoose.Schema({
  _id:mongoose.Types.ObjectId,
  name:String,
  location:String,
  district:String,
  img:String,
  product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "products"
  }],
})
const FarmerList = mongoose.model("farmers", farmerlists); // use the schema
app.get("/farmers", async (req, res) => {
  try {
    const data = await FarmerList.find(); // fetch all farmers
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching farmers");
  }
});
//end of another example
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


  
//6 run it
app.listen(5000,()=>{
    console.log("Server running at port http://localhost:5000");
})

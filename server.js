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

//4th step connecting both schema structure and the farmer_product collection and making that as a model
const FarmerProduct=mongoose.model("farmer_products",farmerProductSchema);

//5th step getting all details from farmer_products
  app.get("/farmer_products", async (req, res) => {
    try {
      const products = await FarmerProduct.aggregate([ // aggregate used to work with joining in mongodb processes in stages
      {
        $lookup: {
          from: "products",             // The name of the other collection
          localField: "product_id",     // Field in farmerproducts
          foreignField: "_id",          // Field in products collection
          as: "product_details"         // Output field to store matched product
        }
      },
    
        {
          $unwind: "$product_details" // flattens the product_details array
        }
      ]);
  
      res.json(products);
    } catch (err) {
      res.status(500).send("Error fetching joined products");
    }
  });

  
//6 run it
app.listen(5000,()=>{
    console.log("Server running at port http://localhost:5000");
})

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FarmerProfile.css";

type Farmer = {
  _id: string;
  name: string;
  location: string;
  district: string;
  img: string;
  products: string[]; // Array of product_id (ObjectId as string)
};

type FarmerProduct = {
  _id: string;
  farmer_id: string;
  product_id: string;
  price: number;
  image: string;
};

function FarmerProfile() {
  const { id } = useParams(); // Grab the farmer ID from the URL
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch the farmer details
    const fetchFarmer = async () => {
      try {
        const farmerRes = await axios.get<Farmer>(
          `http://localhost:5000/farmers/${id}`
        );
        setFarmer(farmerRes.data);

        // Fetch farmer_products based on farmer_id
        const productRes = await axios.get<FarmerProduct[]>(
          `http://localhost:5000/farmer_products?farmer_id=${id}`
        );
        setFarmerProducts(productRes.data);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

  if (loading) return <div>Loading Farmer Profile...</div>;
  if (!farmer) return <div>Farmer not found!</div>;

  return (
    <div className="farmer-profile-container">
      <div className="farmer-header">
        <img src={farmer.img} alt={farmer.name} className="profile-img" />
        <div>
          <h2>{farmer.name}</h2>
          <p>📍 {farmer.location}</p>
          <p>🏘️ {farmer.district}</p>
        </div>
        <button onClick={() => navigate(`/contribute/${farmer._id}`)}>
          Contribute
        </button>
      </div>

      <div className="farm-slider-section">
        <h3>Farm Images (Coming Soon)</h3>
        <div className="slider-placeholder">
          <img src="https://via.placeholder.com/300x150" alt="Farm" />
          <img src="https://via.placeholder.com/300x150" alt="Farm" />
          <img src="https://via.placeholder.com/300x150" alt="Farm" />
        </div>
      </div>

      <div className="products-section">
        <h3>Products in Market</h3>
        <div className="product-grid">
          {farmerProducts.map((prod) => (
            <div key={prod._id} className="product-card">
              <img src={prod.image} alt="Product" />
              <p>₹{prod.price} / kg</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FarmerProfile;

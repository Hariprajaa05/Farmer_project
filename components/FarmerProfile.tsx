import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FarmerProfile.css";

interface Farmer {
  _id: string;
  name: string;
  location: string;
  district: string;
  img: string;
  products: string[];
  description?: string;
  experience?: number;
  certifications?: string[];
}

interface FarmerProduct {
  _id: string;
  farmer_id: string;
  product_id: string;
  price: number;
  image: string;
  stock?: number;
  product_details?: {
    name: string;
    category: string;
    description?: string;
  };
}

interface Collection {
  _id: string;
  farmer_id: string;
  name: string;
  description: string;
  image: string;
  products?: string[];
}

function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (!id) {
      setError("No farmer ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // First fetch the farmer details
        const farmerRes = await axios.get<Farmer>(
          `http://localhost:5000/farmers/${id}`
        );
        setFarmer(farmerRes.data);

        // Then fetch only the products for this specific farmer
        const productsRes = await axios.get<FarmerProduct[]>(
          `http://localhost:5000/farmer_products?farmer_id=${id}`
        );

        // Filter products to ensure they belong to this farmer
        const farmerProducts = productsRes.data.filter(
          (product) => product.farmer_id === id
        );
        setFarmerProducts(farmerProducts);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load farmer data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get unique categories from the farmer's products
  const categories = [
    "All",
    ...new Set(
      farmerProducts
        .map((p) => p.product_details?.category)
        .filter((category): category is string => Boolean(category))
    ),
  ];

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === "All"
      ? farmerProducts
      : farmerProducts.filter(
          (p) => p.product_details?.category === selectedCategory
        );

  if (loading) return <div className="loading">Loading Farmer Profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!farmer) return <div className="error">Farmer not found!</div>;

  return (
    <div className="farmer-profile-container">
      <div className="farmer-header">
        <div className="profile-img-container">
          <img
            src={farmer.img || "/placeholder-avatar.png"}
            alt={farmer.name}
            className="profile-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-avatar.png";
            }}
          />
        </div>
        <div className="farmer-info">
          <h2>{farmer.name}</h2>
          <p>📍 {farmer.location}</p>
          <p>🏘️ {farmer.district}</p>
          {farmer.experience && (
            <p>🌱 {farmer.experience} years of farming experience</p>
          )}
          {farmer.description && (
            <p className="farmer-description">{farmer.description}</p>
          )}
          {farmer.certifications && farmer.certifications.length > 0 && (
            <div className="certifications">
              <p>🏆 Certifications:</p>
              <div className="certification-tags">
                {farmer.certifications.map((cert, index) => (
                  <span key={index} className="certification-tag">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          className="contribute-btn"
          onClick={() => navigate(`/contribute/${farmer._id}`)}
        >
          Contribute
        </button>
      </div>

      <div className="farm-image-section">
        <h3>Farm Overview</h3>
        <div className="farm-image-wrapper">
          <img src="/placeholder-farm.jpg" alt="Farm" className="farm-image" />
        </div>
      </div>

      <div className="products-section">
        <h3>Products</h3>
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => category && setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products available in this category</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((prod) => (
              <div key={prod._id} className="product-card">
                <img
                  src={prod.image || "/placeholder-product.png"}
                  alt={prod.product_details?.name || "Product"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-product.png";
                  }}
                />
                <h4>{prod.product_details?.name || "Unknown Product"}</h4>
                <p className="product-price">₹{prod.price.toFixed(2)} / kg</p>
                {prod.stock !== undefined && (
                  <p className="stock-info">Stock: {prod.stock} kg</p>
                )}
                {prod.product_details?.description && (
                  <p className="product-description">
                    {prod.product_details.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {collections.length > 0 && (
        <div className="collections-section">
          <h3>Collections</h3>
          <div className="collection-list">
            {collections.map((collection) => (
              <div key={collection._id} className="collection-card">
                <img
                  src={collection.image || "/placeholder-collection.png"}
                  alt={collection.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-collection.png";
                  }}
                />
                <div className="collection-content">
                  <h4>{collection.name}</h4>
                  <p>{collection.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerProfile;

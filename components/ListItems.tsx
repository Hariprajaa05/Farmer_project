import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ListItems.css";

interface ProductDetails {
  _id: string;
  name: string;
  category: string;
}

interface FarmerDetails {
  _id: string;
  name: string;
  location: string;
  district: string;
  img?: string; // Made optional
  products: string[];
}

interface FarmerProduct {
  _id: string;
  farmer_id: string;
  product_id: string;
  price: number;
  image?: string; // Made optional
  product_details: ProductDetails;
  farmer_details: FarmerDetails;
}

const ListItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<FarmerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/farmer_products"
        );
        setItems(response.data);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (id: string, qty: number) => {
    // Round to 1 decimal place to avoid floating point precision issues
    const roundedQty = Math.round(qty * 10) / 10;

    // Ensure quantity stays between 0 and 3
    if (roundedQty >= 0 && roundedQty <= 3) {
      setQuantities((prev) => ({
        ...prev,
        [id]: roundedQty,
      }));
    }
  };

  const categories = ["All", "Vegetables", "Fruit", "Dairy"];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "vegetables":
        return "#C8E6C9"; // Light Green
      case "fruit":
        return "#FFE0B2"; // Light Orange
      case "dairy":
        return "#BBDEFB"; // Light Blue
      default:
        return "#E0E0E0"; // Light Grey
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.product_details?.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      item.product_details?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.farmer_details?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleFarmerClick = (farmerId: string) => {
    navigate(`/farmer/${farmerId}`);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;
  if (items.length === 0)
    return <div className="empty">No products available</div>;

  return (
    <div className="products-container">
      <div className="header-actions">
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search products or farmers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            style={{
              backgroundColor:
                selectedCategory === cat
                  ? getCategoryColor(cat)
                  : "transparent",
              borderColor: getCategoryColor(cat),
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredItems.map((item) => {
          const qty = quantities[item._id] || 0;
          const badgeColor = getCategoryColor(
            item.product_details?.category || ""
          );
          return (
            <div key={item._id} className="product-card">
              <div className="product-image-container">
                <img
                  src={item.image || "/placeholder-product.png"}
                  alt={`Image of ${item.product_details?.name}`}
                  className="product-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-product.png";
                  }}
                />
                <div
                  className="product-badge"
                  style={{ backgroundColor: badgeColor }}
                >
                  {item.product_details?.category || "Unknown"}
                </div>
              </div>
              <div className="product-content">
                <h3 className="product-name">
                  {item.product_details?.name || "Unknown Product"}
                </h3>
                <p className="product-price">₹{item.price.toFixed(2)} / kg</p>

                <div
                  className="farmer-info"
                  onClick={() => handleFarmerClick(item.farmer_details._id)}
                >
                  <div className="farmer-profile">
                    <div className="farmer-avatar-container">
                      <img
                        src={
                          item.farmer_details?.img || "/placeholder-avatar.png"
                        }
                        alt={item.farmer_details?.name}
                        className="farmer-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-avatar.png";
                        }}
                      />
                    </div>
                    <div className="farmer-details">
                      <p className="farmer-name">
                        {item.farmer_details?.name || "Unknown Farmer"}
                      </p>
                      <p className="farmer-location">
                        📍{" "}
                        {item.farmer_details?.location ||
                          "Location not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="quantity-control">
                  <div className="quantity-buttons">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item._id, qty - 0.5)}
                      disabled={qty <= 0}
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {qty > 0 ? `${qty} kg` : "Add"}
                    </span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item._id, qty + 0.5)}
                    >
                      +
                    </button>
                  </div>

                  {qty > 0 && (
                    <>
                      <div className="total-price">
                        Total: ₹{(qty * item.price).toFixed(2)}
                      </div>
                      <button className="buy-button">Add to Cart</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListItems;

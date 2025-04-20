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
  farm: string[];
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

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  quantity: number;
}

interface FundingRequest {
  id: number;
  farmer_id: string;
  title: string;
  description: string;
  amount_needed: number;
  amount_raised: number;
  status: "open" | "closed";
  created_at: string;
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [showFundingRequests, setShowFundingRequests] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState("");

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "vegetable":
        return "#90EE90"; // Light Green
      case "fruit":
        return "#FF9800"; // Orange
      case "dairy":
        return "#2196F3"; // Blue
      default:
        return "#9E9E9E"; // Grey
    }
  };

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

        // Fetch funding requests for this farmer
        try {
          const fundingRes = await axios.get<FundingRequest[]>(
            `http://localhost:5000/funding-requests/${id}`
          );
          setFundingRequests(fundingRes.data);
        } catch (fundingErr) {
          console.error("Error fetching funding requests:", fundingErr);
          // Don't set error here, as it's not critical for the main profile
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load farmer data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(
          `/api/farmers/${id}/products`
        );
        setProducts(response.data);
        // Initialize quantities for all products
        const initialQuantities = response.data.reduce(
          (acc: { [key: string]: number }, product: Product) => {
            acc[product.id.toString()] = 0;
            return acc;
          },
          {}
        );
        setQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [id]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Get unique categories from the farmer's products
  const categories = [
    "All",
    ...new Set(
      farmerProducts
        .map((p) => p.product_details?.category)
        .filter((category): category is string => Boolean(category))
    ),
  ];

  // Filter products by selected category and search query
  const filteredProducts = farmerProducts.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.product_details?.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      item.product_details?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleQuantityChange = (productId: string, change: number) => {
    setQuantities((prev) => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(
        0,
        Math.min(3, currentQuantity + change * 0.5)
      );
      // Round to 1 decimal place to avoid floating point issues
      return { ...prev, [productId]: Number(newQuantity.toFixed(1)) };
    });
  };

  const handleAddToCart = async (productId: string) => {
    if (quantities[productId] <= 0) return;

    try {
      await axios.post("/api/cart/add", {
        productId,
        quantity: quantities[productId],
      });
      // Reset quantity after adding to cart
      setQuantities((prev) => ({ ...prev, [productId]: 0 }));
      // You might want to show a success message here
    } catch (error) {
      console.error("Error adding to cart:", error);
      // You might want to show an error message here
    }
  };

  const calculateProgress = (raised: number, needed: number) => {
    return Math.min(Math.round((raised / needed) * 100), 100);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Here you would typically make an API call to save the subscription
      // For now, we'll just simulate a successful subscription
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSubscribed(true);
      setShowSubscribeModal(false);
      setEmail("");
    } catch (err) {
      console.error("Error subscribing:", err);
      setError("Failed to subscribe. Please try again later.");
    }
  };

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
        <div className="action-buttons">
          {fundingRequests.length > 0 && (
            <button
              className="view-funding-btn"
              onClick={() => setShowFundingRequests(!showFundingRequests)}
            >
              {showFundingRequests
                ? "Hide Funding Requests"
                : "View Funding Requests"}
            </button>
          )}
          <button
            className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
            onClick={() => (isSubscribed ? null : setShowSubscribeModal(true))}
          >
            {isSubscribed ? "Subscribed ✓" : "Subscribe"}
          </button>
        </div>
      </div>

      {showFundingRequests && fundingRequests.length > 0 && (
        <div className="funding-requests-section">
          <h3>Funding Requests</h3>
          <div className="funding-requests-container">
            {fundingRequests.map((request) => (
              <div key={request.id} className="funding-request-card">
                <div className="request-header">
                  <h4>{request.title}</h4>
                  <span className={`status-badge ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </span>
                </div>
                <p className="description">{request.description}</p>
                <div className="funding-details">
                  <div className="amount-info">
                    <div className="amount-needed">
                      <span>Amount Needed:</span>
                      <span className="amount">
                        ₹{request.amount_needed.toFixed(2)}
                      </span>
                    </div>
                    <div className="amount-raised">
                      <span>Amount Raised:</span>
                      <span className="amount">
                        ₹{request.amount_raised.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${calculateProgress(
                          request.amount_raised,
                          request.amount_needed
                        )}%`,
                      }}
                    ></div>
                    <span className="progress-text">
                      {calculateProgress(
                        request.amount_raised,
                        request.amount_needed
                      )}
                      %
                    </span>
                  </div>
                </div>
                {request.status === "open" && (
                  <button
                    className="donate-button"
                    onClick={() => navigate(`/contribute/${farmer._id}`)}
                  >
                    Donate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {farmer.farm && farmer.farm.length > 0 && (
        <div className="farm-overview-section">
          <h3>🌾 Farm Overview</h3>
          <div className="farm-images-container">
            {farmer.farm.map((farmImgUrl, index) => (
              <img
                key={index}
                src={farmImgUrl}
                alt={`Farm ${index + 1}`}
                className="farm-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-farm.png";
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="products-section">
        <div className="products-header">
          <h3 className="products-title">Products On The Market</h3>
          <div className="products-search-container">
            <input
              type="text"
              className="products-search-bar"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category
                    ? getCategoryColor(category)
                    : "transparent",
                borderColor: getCategoryColor(category),
              }}
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
                <div className="quantity-control">
                  <div className="quantity-buttons">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(prod._id, -1)}
                      disabled={quantities[prod._id] <= 0}
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {quantities[prod._id]} kg
                    </span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(prod._id, 1)}
                      disabled={quantities[prod._id] >= 3}
                    >
                      +
                    </button>
                  </div>
                  {quantities[prod._id] > 0 && (
                    <>
                      <div className="total-price">
                        Total: ₹{(prod.price * quantities[prod._id]).toFixed(2)}
                      </div>
                      <button
                        className="buy-button"
                        onClick={() => handleAddToCart(prod._id)}
                      >
                        Add to Cart
                      </button>
                    </>
                  )}
                </div>
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

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="modal-overlay">
          <div className="subscribe-modal">
            <h3>Subscribe to Updates</h3>
            <p>
              Get notified about new products, funding requests, and updates
              from {farmer.name}.
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowSubscribeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default FarmerProfile;

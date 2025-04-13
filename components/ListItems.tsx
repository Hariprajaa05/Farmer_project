import React, { useEffect, useState } from "react";
import axios from "axios";
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
  img: string;
  products: string[];
}

interface FarmerProduct {
  _id: string;
  farmer_id: string;
  product_id: string;
  price: number;
  image: string;
  product_details: ProductDetails;
  farmer_details: FarmerDetails;
}

function ListItems() {
  const [items, setItems] = useState<FarmerProduct[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    axios
      .get("http://localhost:5000/farmer_products")
      .then((res) => setItems(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleQuantityChange = (id: string, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: qty,
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "vegetables":
        return "var(--vegetable-color)";
      case "dairy":
        return "var(--dairy-color)";
      case "fruits":
        return "var(--fruit-color)";
      default:
        return "var(--default-color)";
    }
  };

  const handleBuyNow = (item: FarmerProduct, quantity: number) => {
    // TODO: Implement buy functionality
    console.log(
      `Buying ${quantity}kg of ${item.product_details.name} from ${item.farmer_details.name}`
    );
  };

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter(
          (item) =>
            item.product_details.category.toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  const categories = [
    "all",
    ...new Set(items.map((item) => item.product_details.category)),
  ];

  return (
    <div className="products-container">
      <h2 className="products-header">Available Products</h2>

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
            style={{
              backgroundColor:
                category === "all"
                  ? "var(--default-color)"
                  : getCategoryColor(category),
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredItems.map((item) => {
          const qty = quantities[item._id] || 0;
          const categoryColor = getCategoryColor(item.product_details.category);
          return (
            <div key={item._id} className="product-card">
              <div className="product-image-container">
                <img
                  src={item.image}
                  alt={`Image of ${item.product_details.name}`}
                  className="product-image"
                />
                <div
                  className="product-badge"
                  style={{ backgroundColor: categoryColor }}
                >
                  {item.product_details.category}
                </div>
              </div>
              <div className="product-content">
                <h3 className="product-name">{item.product_details.name}</h3>
                <p className="product-price">₹{item.price} / kg</p>
                <div className="farmer-info">
                  <div className="farmer-profile">
                    <img
                      src={item.farmer_details?.img}
                      alt={item.farmer_details?.name}
                      className="farmer-avatar"
                    />
                    <span className="farmer-name">
                      {item.farmer_details?.name}
                    </span>
                  </div>
                </div>
                <div className="quantity-control">
                  <div className="quantity-buttons">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        handleQuantityChange(item._id, Math.max(0, qty - 0.5))
                      }
                      disabled={qty === 0}
                    >
                      -
                    </button>
                    <span className="quantity-display">
                      {qty > 0 ? `${qty} kg` : "Add"}
                    </span>
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        handleQuantityChange(item._id, Math.min(4, qty + 0.5))
                      }
                      disabled={qty >= 4}
                    >
                      +
                    </button>
                  </div>
                  {qty > 0 && (
                    <>
                      <div className="total-price">
                        Total: ₹{(qty * item.price).toFixed(2)}
                      </div>
                      <button
                        className="buy-button"
                        onClick={() => handleBuyNow(item, qty)}
                      >
                        Buy Now
                      </button>
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
}

export default ListItems;

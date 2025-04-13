import React, { useState, useEffect } from "react";
import "./ListItems.css";

// 🛒 This defines the structure of each farmer and their products
interface FarmerProduct {
  _id: string;
  farmer_id: {
    name: string;
    location: string;
    district: string;
    img: string;
  };
  product_id: {
    name: string;
  };
  price: number;
  image: string;
}

function ListItems() {
  // 🧺 State to hold list of farmer products
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // 🌐 Fetch farmer products data from backend when component loads
  useEffect(() => {
    fetch("http://localhost:5000/farmer_products")
      .then((res) => res.json())
      .then((data: FarmerProduct[]) => setFarmerProducts(data))
      .catch((err) => console.error("Error fetching:", err));
  }, []);

  // 🔁 This function is called when user selects a quantity
  const handleQuantityChange = (id: string, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: qty,
    }));
  };

  return (
    <div className="products-container">
      <h1 className="products-header">Farmer Products</h1>

      {farmerProducts.length === 0 ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="products-grid">
          {farmerProducts.map((item) => {
            const qty = quantities[item._id] || 1;
            return (
              <div key={item._id} className="product-card">
                <div className="farmer-info">
                  <img
                    src={item.farmer_id.img}
                    alt={`${item.farmer_id.name}'s profile`}
                    className="farmer-image"
                  />
                  <div className="farmer-details">
                    <h3 className="farmer-name">{item.farmer_id.name}</h3>
                    <p className="farmer-location">
                      {item.farmer_id.location}, {item.farmer_id.district}
                    </p>
                  </div>
                </div>
                <img src={item.image} alt="product" className="product-image" />
                <div className="product-details">
                  <h2 className="product-name">
                    {item.product_id?.name ?? "Unnamed Product"}
                  </h2>
                  <p className="product-price">Price per kg: ₹{item.price}</p>
                  <div className="quantity-selector">
                    <label>
                      Quantity:
                      <select
                        value={qty}
                        onChange={(e) =>
                          handleQuantityChange(item._id, Number(e.target.value))
                        }
                      >
                        {[0.5, 1, 2, 3].map((kg) => (
                          <option key={kg} value={kg}>
                            {kg} kg - ₹{kg * item.price}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ListItems;

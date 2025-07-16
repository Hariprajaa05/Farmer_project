import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FarmerEditPage.css";

interface Farmer {
  _id: string;
  name: string;
  location: string;
  district: string;
  img: string;
  farm: string[];
  products: string[];
  experience?: number;
  certifications?: string[];
}

interface FarmerProduct {
  _id: string;
  farmer_id: string;
  product_id: string;
  price: number;
  image: string;
  product_details: {
    name: string;
    category: string;
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  farmerName: string;
}

function FarmerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    if (!id) {
      setError("No farmer ID provided");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const farmerRes = await axios.get<Farmer>(
          `http://localhost:5000/farmers/${id}`
        );
        setFarmer(farmerRes.data);

        const productsRes = await axios.get<FarmerProduct[]>(
          `http://localhost:5000/farmer_products?farmer_id=${id}`
        );
        setFarmerProducts(
          productsRes.data.filter((product) => product.farmer_id === id)
        );
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
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    if (farmer) {
      const farmerCartItems = items.filter(
        (item: CartItem) => item.farmerName === farmer.name
      );
      setCartItems(farmerCartItems);
    }
  }, [farmer, showCart]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (farmer) {
      setFarmer({
        ...farmer,
        [name]: value,
      });
    }
  };

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    productId: string
  ) => {
    const { name, value } = e.target;
    setFarmerProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product._id === productId) {
          if (name === "price") {
            return {
              ...product,
              [name]: Number(value),
            };
          } else if (name === "image") {
            return {
              ...product,
              image: value,
            };
          } else {
            return {
              ...product,
              product_details: {
                ...product.product_details,
                [name]: value,
              },
            };
          }
        }
        return product;
      })
    );
  };

  const handleNewProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/farmer_products`,
        {
          farmer_id: id,
          price: Number(newProduct.price),
          image: newProduct.image,
          product_details: {
            name: newProduct.name,
            category: newProduct.category,
          },
        }
      );

      setFarmerProducts((prev) => [...prev, response.data]);
      setNewProduct({
        name: "",
        price: "",
        image: "",
        category: "",
      });
    } catch (err) {
      console.error("Error adding product:", err);
      setError("Failed to add product. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    try {
      // Update farmer profile
      await axios.put(`http://localhost:5001/farmers/${id}`, {
        name: farmer.name,
        location: farmer.location,
        district: farmer.district,
        img: farmer.img,
      });

      // Update products
      for (const product of farmerProducts) {
        await axios.put(
          `http://localhost:5001/farmer_products/${product._id}`,
          {
            price: product.price,
            image: product.image,
            product_details: product.product_details,
          }
        );
      }

      alert("Profile and products updated successfully!");
      navigate(`/farmer/profile/${id}`);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const updatedItems = cartItems
      .map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
      .filter((item) => item.quantity > 0);

    const allCartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const otherItems = allCartItems.filter(
      (item: CartItem) => item.farmerName !== farmer?.name
    );
    const newCart = [...otherItems, ...updatedItems];
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCartItems(updatedItems);
    window.dispatchEvent(new Event("storage"));
  };

  if (loading) return <div className="loading">Loading farmer profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!farmer) return <div className="error">Farmer not found!</div>;

  return (
    <div className="farmer-profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <img
            src={farmer.img || "https://via.placeholder.com/150"}
            alt={farmer.name}
            className="profile-image"
          />
          {isEditing && (
            <div className="image-edit-overlay">
              <input
                type="text"
                name="img"
                value={farmer.img}
                onChange={handleChange}
                placeholder="Enter image URL"
                className="image-url-input"
              />
            </div>
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={farmer.name}
              onChange={handleChange}
              className="profile-name-input"
              placeholder="Enter your name"
            />
          ) : (
            <h1 className="profile-name">{farmer.name}</h1>
          )}
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-group">
          <label className="detail-label">Location</label>
          {isEditing ? (
            <input
              type="text"
              name="location"
              value={farmer.location}
              onChange={handleChange}
              className="detail-input"
              placeholder="Enter your location"
            />
          ) : (
            <p className="detail-value">{farmer.location}</p>
          )}
        </div>

        <div className="detail-group">
          <label className="detail-label">District</label>
          {isEditing ? (
            <input
              type="text"
              name="district"
              value={farmer.district}
              onChange={handleChange}
              className="detail-input"
              placeholder="Enter your district"
            />
          ) : (
            <p className="detail-value">{farmer.district}</p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        <button
          className="view-cart-btn"
          onClick={() => setShowCart(!showCart)}
        >
          {showCart ? "Hide Cart" : "View Cart"}
        </button>
        <button type="submit" className="save-btn" onClick={handleSubmit}>
          Save Changes
        </button>
        <button
          className="cancel-btn"
          onClick={() => navigate(`/farmer/profile/${id}`)}
        >
          Cancel
        </button>
      </div>

      {showCart && (
        <div className="cart-section">
          <h2>Cart Items</h2>
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">No items in cart</p>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Price: ₹{item.price} / kg</p>
                    <div className="quantity-control">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 0.5)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity} kg</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 0.5)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="products-section">
        <h2 className="section-title">Products</h2>
        <div className="products-grid">
          {farmerProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.product_details?.name}
                  className="product-image"
                />
                {isEditing && (
                  <div className="product-image-edit">
                    <input
                      type="text"
                      name="image"
                      value={product.image}
                      onChange={(e) => handleProductChange(e, product._id)}
                      placeholder="Enter image URL"
                      className="product-image-input"
                    />
                  </div>
                )}
              </div>
              <div className="product-details">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={product.product_details?.name}
                      onChange={(e) => handleProductChange(e, product._id)}
                      className="product-input"
                      placeholder="Product name"
                    />
                    <input
                      type="text"
                      name="price"
                      value={product.price}
                      onChange={(e) => handleProductChange(e, product._id)}
                      className="product-input"
                      placeholder="Price"
                    />

                    <input
                      type="text"
                      name="category"
                      value={product.product_details?.category}
                      onChange={(e) => handleProductChange(e, product._id)}
                      className="product-input"
                      placeholder="Category"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="product-name">
                      {product.product_details?.name}
                    </h3>
                    <p className="product-price">₹{product.price}</p>
                    <p className="product-category">
                      {product.product_details?.category}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="add-product-section">
            <h3>Add New Product</h3>
            <div className="new-product-form">
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                placeholder="Product name"
                className="product-input"
              />
              <input
                type="text"
                name="price"
                value={newProduct.price}
                onChange={handleNewProductChange}
                placeholder="Price"
                className="product-input"
              />
              <input
                type="text"
                name="image"
                value={newProduct.image}
                onChange={handleNewProductChange}
                placeholder="Image URL"
                className="product-input"
              />
              <input
                type="text"
                name="category"
                value={newProduct.category}
                onChange={handleNewProductChange}
                placeholder="Category"
                className="product-input"
              />
              <button
                type="button"
                className="add-product-btn"
                onClick={handleAddProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerEditPage;

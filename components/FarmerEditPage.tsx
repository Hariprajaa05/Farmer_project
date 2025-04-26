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
}

function FarmerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No farmer ID provided");
      setLoading(false);
      return;
    }

    const fetchFarmer = async () => {
      try {
        const res = await axios.get<Farmer>(
          `http://localhost:5000/farmers/${id}`
        );
        setFarmer(res.data);
      } catch (err) {
        console.error("Error fetching farmer:", err);
        setError("Failed to load farmer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    const updateData = {
      name: farmer.name,
      location: farmer.location,
      district: farmer.district,
      img: farmer.img,
    };

    try {
      await axios.put(`http://localhost:5001/farmers/${id}`, updateData);
      alert("Profile updated successfully!");
      navigate(`/farmer/profile/${id}`);
    } catch (err) {
      console.error("Error updating farmer:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading farmer profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!farmer) return <div className="error">Farmer not found!</div>;

  return (
    <div className="farmer-edit-container">
      <h2>Edit Your Profile</h2>
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={farmer.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={farmer.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>District:</label>
          <input
            type="text"
            name="district"
            value={farmer.district}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Profile Image URL:</label>
          <input
            type="text"
            name="img"
            value={farmer.img}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default FarmerEditPage;

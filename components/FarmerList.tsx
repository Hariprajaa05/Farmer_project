import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FarmerList.css";
//using typescipt define your object
type Farmer = {
  _id: string;
  name: string;
  location: string;
  district: string;
  img: string;
};

function FarmerList() {
  //asusual we have the usestate
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  //we have the useeffect to get the data from db and store it in usestate
  useEffect(() => {
    axios
      .get<Farmer[]>("http://localhost:5000/farmers")
      .then((res) => {
        setFarmers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading farmer profiles...</div>;
  }

  //we map the usestate and then we display it
  return (
    <div className="farmer-list-container">
      <h2 className="farmer-list-header">Farmer Profiles</h2>
      <div className="farmer-grid">
        {farmers.map((farmer /**any name */) => (
          <div key={farmer._id} className="farmer-card">
            <div className="farmer-image-container">
              <img
                src={farmer.img}
                alt={`${farmer.name}'s profile`}
                className="farmer-image"
              />
            </div>
            <div className="farmer-content">
              <h3 className="farmer-name">{farmer.name}</h3>
              <div className="farmer-details">
                <div className="farmer-detail-item">
                  <span className="farmer-detail-icon">📍</span>
                  <span className="farmer-location">{farmer.location}</span>
                </div>
                <div className="farmer-detail-item">
                  <span className="farmer-detail-icon">🏘️</span>
                  <span className="farmer-district">{farmer.district}</span>
                </div>
              </div>
              <a href={`/farmer/${farmer._id}`} className="farmer-view-button">
                View Profile
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmerList;

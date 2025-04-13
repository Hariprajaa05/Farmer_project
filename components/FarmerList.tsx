import React, { useEffect, useState } from "react";
import axios from "axios";
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
  //we have the useeffect to get the data from db and store it in usestate
  useEffect(() => {
    axios
      .get<Farmer[]>("http://localhost:5000/farmers")
      .then((res) => setFarmers(res.data))
      .catch((err) => console.log(err));
  }, []);
  //we map the usestate and then we display it
  return (
    <div>
      <h2>Farmer Profiles</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {farmers.map((farmer /**any name */) => (
          <div
            key={farmer._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "8px",
              width: "200px",
            }}
          >
            <img
              src={farmer.img}
              alt={`${farmer.name} image`} //noteeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <h3>{farmer.name}</h3>
            <p>
              <strong>Location:</strong> {farmer.location}
            </p>
            <p>
              <strong>District:</strong> {farmer.district}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmerList;

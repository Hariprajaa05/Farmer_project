import { useParams } from "react-router-dom";

function FarmerProfile() {
  const { name } = useParams();
  return (
    <div className="container mt-4">
      <h1>Farmer Profile</h1>
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <p className="card-text">This is the profile page for {name}</p>
          {/* Add more farmer details here */}
        </div>
      </div>
    </div>
  );
}

export default FarmerProfile;

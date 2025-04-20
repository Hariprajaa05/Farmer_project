import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./Contribute.css";

interface FundingRequest {
  id: string;
  title: string;
  description?: string;
  amount_needed: number;
  amount_raised: number;
  status: "open" | "closed";
}

const Contribute: React.FC = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [donateAmount, setDonateAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get<FundingRequest[]>(
          `http://localhost:5000/funding-requests/${farmerId}`
        );
        setFundingRequests(response.data);
      } catch (err) {
        console.error("Failed to load funding requests", err);
      }
    };

    if (farmerId) {
      fetchRequests();
    }
  }, [farmerId]);

  const handleDonate = async (requestId: string) => {
    const amount = parseFloat(donateAmount[requestId]);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/donations", {
        funding_request_id: requestId,
        donor_name: "Anonymous",
        amount: amount,
      });

      alert("Thank you for your contribution!");

      // Refresh the list after donation
      const updated = await axios.get<FundingRequest[]>(
        `http://localhost:5000/funding-requests/${farmerId}`
      );
      setFundingRequests(updated.data);

      setDonateAmount((prev) => ({ ...prev, [requestId]: "" }));
    } catch (err) {
      console.error("Donation failed", err);
      alert("Something went wrong while donating.");
    }
  };

  return (
    <div className="contribute-page">
      <h2>Support Your Local Farmer 💚</h2>
      <div className="cards-container">
        {fundingRequests.map((request) => (
          <div key={request.id} className="funding-card">
            <h3>{request.title}</h3>
            <p>{request.description}</p>
            <p>
              <strong>Needed:</strong> ₹{request.amount_needed}
            </p>
            <p>
              <strong>Raised:</strong> ₹{request.amount_raised}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {request.status === "open" ? "🟢 Open" : "🔴 Closed"}
            </p>

            {request.status === "open" && (
              <>
                <input
                  type="number"
                  placeholder="Enter amount ₹"
                  value={donateAmount[request.id] || ""}
                  onChange={(e) =>
                    setDonateAmount((prev) => ({
                      ...prev,
                      [request.id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => handleDonate(request.id)}>Donate</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contribute;

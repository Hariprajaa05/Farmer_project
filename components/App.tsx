import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import FarmerList from "./components/FarmerList";
import FarmerProfile from "./components/FarmerProfile";
import ListItems from "./components/ListItems";
import Contribute from "./components/Contribute";
import Header from "./components/Header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import SeasonalCrops from "./SeasonalCrops";
import Cart from "./components/Cart";
import "./App.css";
import FarmerEditPage from "./components/FarmerEditPage";
import { AuthProvider } from "./components/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/farmers"
              element={
                <>
                  <Header />
                  <FarmerList />
                </>
              }
            />

            <Route
              path="/farmer/:id"
              element={
                <>
                  <Header />
                  <FarmerProfile />
                </>
              }
            />

            {/* 👇 Additional route to prevent blank screen after saving */}
            <Route
              path="/farmer/profile/:id"
              element={
                <>
                  <Header />
                  <FarmerProfile />
                </>
              }
            />

            <Route
              path="/contribute/:farmerId"
              element={
                <>
                  <Header />
                  <Contribute />
                </>
              }
            />
            <Route
              path="/seasonalcrops"
              element={
                <>
                  <Header />
                  <SeasonalCrops />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Header />
                  <Login />
                </>
              }
            />
            <Route
              path="/signup"
              element={
                <>
                  <Header />
                  <Signup />
                </>
              }
            />
            <Route
              path="/cart"
              element={
                <>
                  <Header />
                  <Cart />
                </>
              }
            />
            <Route
              path="/farmer/:id/edit"
              element={
                <>
                  <Header />
                  <FarmerEditPage />
                </>
              }
            />
            <Route
              path="/products"
              element={
                <>
                  <Header />
                  <ListItems />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Splash from "../components/Splash";
import DriverLogin from "../pages/Auth/DriverLogin";
import DriverDashboard from "../pages/Dashboard/DriverDashboard";
import PaymentReturn from "../components/PaymentReturn";
import PaymentCallback from "../components/PaymentCallback";
import "../App.css";
import DriverRegistration from "../pages/Auth/DriverRegistration";
import Earnings from "../pages/Earnings/Earnings";
import Profile from "../pages/Profile/Profile";
import Trips from "../pages/Trips/Trips";
import Wallet from "../pages/Wallet/Wallet";
import Help from "../pages/Help/Help";
import Referrals from "../pages/Referrals/Referrals";
import Account from "../pages/Account/Account";
import ProfileManagement from "../pages/ProfileManagement/ProfileManagement";
import Inbox from "../pages/Inbox/Inbox";
function AllRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading");

  const handleLogin = () => {
    setLoadingMessage("Logging in");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setLoadingMessage("Logging out");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    setLoadingMessage("");
    setIsLoading(true);

    const splashTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 4000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <Router>
      <Splash isLoading={isLoading} message={loadingMessage} dots={true} />
      {!isLoading && (
        <div className={`app ${showContent ? "fade-in" : ""}`}>
          <Routes>
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            {/* register */}
            <Route
              path="/driver-registration"
              element={<DriverRegistration />}
            />
            <Route path="/help" element={<Help />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/dashboard" element={<DriverDashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/account" element={<Account/>} />
            <Route path="/profile-management" element={<ProfileManagement/>} />

            <Route path="/" element={<DriverLogin />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default AllRoutes;
// Assuming you have a Profile component

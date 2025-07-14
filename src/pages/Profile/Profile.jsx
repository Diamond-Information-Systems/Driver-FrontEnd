import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import { Bell, Menu } from "lucide-react";
import BottomDock from "../../components/BottomDock";
import "./Profile.css";
import {
  User,
  Car,
  Star,
  Camera,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; //get user data from context
import { useNavigate } from "react-router-dom";


function Profile({ onLogout = () => {} }) {
  const { user } = useAuth();

  //log user data to console for debugging
  console.log("User data in Profile component:", user);

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const [activeTab, setActiveTab] = useState("profile");
  const [isOnline, setIsOnline] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);

  // Use user data from context or fallback to empty object
  const driverData = {
    name: user?.user?.name || "",
    email: user?.user?.email || "",
    phone: user?.user?.phone || "",
    memberSince: user?.user?.memberSince || "",
    rating: user?.user?.rating ?? 0,
    totalTrips: user?.user?.totalTrips ?? 0,
    profileImage: user?.user?.profileImage || null,
    address: user?.user?.address || "",
    confirmationRate: user?.user?.confirmationRate ?? 0,
    cancellationRate: user?.user?.cancellationRate ?? 0,
  };

  const vehicleData = user?.user?.vehicle || {
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
  };

  const highlights = user?.user?.highlights || [
    { label: driverData.totalTrips, sublabel: "Trips" },
    { label: driverData.memberSince, sublabel: "On Vaye since" },
  ];

  // Metrics with explanations
  const metricsData = [
    {
      id: "rating",
      title: "Driver rating",
      value: driverData.rating,
      unit: "⭐",
      status: driverData.rating >= 4.5 ? "good" : "warning",
      explanation:
        "Your driver rating is the average of all the ratings riders have given you. It's calculated from your last 500 rated trips. Ratings below 3 stars aren't included in the average to account for factors outside your control.",
    },
    {
      id: "confirmation",
      title: "Confirmation rate",
      value: driverData.confirmationRate,
      unit: "%",
      status: driverData.confirmationRate >= 80 ? "good" : "warning",
      explanation:
        "This is the percentage of trip requests you accept. It's calculated by dividing the number of trips you accepted by the total number of trip requests you received. A higher acceptance rate helps you get more trip requests.",
    },
    {
      id: "cancellation",
      title: "Cancellation rate",
      value: driverData.cancellationRate,
      unit: "%",
      status: driverData.cancellationRate <= 10 ? "good" : "warning",
      explanation:
        "This is the percentage of trips you cancel after accepting them. It's calculated over your last 7 days of driving. Frequent cancellations can affect your access to features and trip requests. Try to only accept trips you can complete.",
    },
  ];

  const toggleMetricExpansion = (metricId) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const handleMenuClick = () => {
    console.log("Menu clicked!");
  };

  const handleNotificationClick = () => {
    console.log("Notifications clicked!");
  };

  const navigate = useNavigate();

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        notificationCount={5}
        onMenuClick={handleMenuClick}
        onNotificationClick={handleNotificationClick}
      />

      {/* Profile Content */}
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-new">
          <div className="profile-main-info">
            <div className="profile-details">
              <h1>{driverData.name}</h1>
                <button
            className="view-profile-btn"
            onClick={() => navigate("/profile-management")}
          >
            <span>View profile</span>
            <ChevronRight size={16} />
          </button>
            </div>
          </div>
          <div className="profile-avatar-display">
            {driverData.profileImage ? (
              <img src={driverData.profileImage} alt="Profile" />
            ) : (
              <User size={28} />
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div className="insights-card">
          <h2>Insights</h2>
          <div className="metrics-container">
            {metricsData.map((metric, index) => (
              <div key={metric.id} className="metric-row">
                <div
                  className="metric-content"
                  onClick={() => toggleMetricExpansion(metric.id)}
                >
                  <div className="metric-indicator">
                    <div className={`status-dot ${metric.status}`}></div>
                    <div className="metric-text">
                      <span className="metric-title">{metric.title}</span>
                      <span className="metric-value">
                        {metric.value}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`expand-icon ${
                      expandedMetric === metric.id ? "rotated" : ""
                    }`}
                  />
                </div>

                {expandedMetric === metric.id && (
                  <div className="metric-explanation">
                    <p>{metric.explanation}</p>
                  </div>
                )}

                {index < metricsData.length - 1 && (
                  <div className="metric-divider"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Section */}
        <div className="highlights-card">
          <h2>Highlights</h2>
          <div className="highlights-container">
            {highlights.map((highlight, index) => (
              <div key={index} className="highlight-box">
                <div className="highlight-number">{highlight.label}</div>
                <div className="highlight-label">{highlight.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="vehicle-card">
          <div className="card-header">
            <h2>Vehicle Information</h2>
            <ChevronRight size={18} className="header-arrow" />
          </div>
          <div className="vehicle-content">
            <div className="vehicle-info-left">
              <Car size={20} className="vehicle-icon" />
              <div className="vehicle-text">
                <div className="vehicle-name">
                  {vehicleData.year} {vehicleData.make} {vehicleData.model}
                </div>
                <div className="vehicle-details">
                  {vehicleData.color} • {vehicleData.licensePlate}
                </div>
              </div>
            </div>
            <div className="vehicle-status">
              <div className="status-indicator active"></div>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Documents Menu */}
        <div className="documents-menu">
          <div className="menu-item-new">
            <div className="menu-content">
              <FileText size={20} className="menu-icon" />
              <span className="menu-text">Documents</span>
            </div>
            <ChevronRight size={18} className="menu-arrow" />
          </div>
        </div>
      </div>

      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />

      <style jsx>{`
        .profile-container {
          padding: 1rem;
          background: #f8f9fa;
          min-height: calc(100vh - 140px);
          /* Ensure enough space for BottomDock */
          padding-bottom: 70px; /* Adjust this value to match your BottomDock's height */
        }

        /* New Profile Header */
        .profile-header-new {
          background: linear-gradient(135deg, #1e2761, #2a3990);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .profile-main-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .profile-avatar {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .change-photo-btn {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: #ffd93d;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1e2761;
        }

        .profile-details h1 {
          margin: 0 0 8px 0;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .view-profile-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.3s ease;
        }

        .view-profile-btn:hover {
          color: white;
        }

        .profile-avatar-display {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .profile-avatar-display img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Insights Card */
        .insights-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .insights-card h2 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e2761;
        }

        .metrics-container {
          display: flex;
          flex-direction: column;
        }

        .metric-row {
          width: 100%;
        }

        .metric-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .metric-content:hover {
          background: rgba(255, 217, 61, 0.05);
          border-radius: 8px;
          margin: 0 -12px;
          padding: 16px 12px;
        }

        .metric-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-dot.good {
          background: #4caf50;
        }

        .status-dot.warning {
          background: #ff9800;
        }

        .metric-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-title {
          font-size: 0.95rem;
          color: #1e2761;
          font-weight: 500;
        }

        .metric-value {
          font-size: 0.9rem;
          color: #666;
          font-weight: 600;
        }

        .expand-icon {
          color: #666;
          transition: transform 0.3s ease;
        }

        .expand-icon.rotated {
          transform: rotate(180deg);
        }

        .metric-explanation {
          padding: 16px 20px 8px 36px;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 8px 0 8px 0;
          border-left: 3px solid #ffd93d;
        }

        .metric-explanation p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #555;
        }

        .metric-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 0;
        }

        /* Highlights Card */
        .highlights-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .highlights-card h2 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e2761;
        }

        .highlights-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .highlight-box {
          text-align: left;
        }

        .highlight-number {
          font-size: 2.2rem;
          font-weight: 800;
          color: #1e2761;
          margin-bottom: 4px;
          line-height: 1;
        }

        .highlight-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        /* Vehicle Card */
        .vehicle-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-header h2 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e2761;
        }

        .header-arrow {
          color: #666;
        }

        .vehicle-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vehicle-info-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vehicle-icon {
          color: #ffd93d;
        }

        .vehicle-name {
          font-weight: 600;
          color: #1e2761;
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .vehicle-details {
          font-size: 0.85rem;
          color: #666;
        }

        .vehicle-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #4caf50;
          font-weight: 500;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.active {
          background: #4caf50;
        }

        /* Documents Menu */
        .documents-menu {
          margin-bottom: 16px;
        }

        .menu-item-new {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .menu-item-new:hover {
          background: #f8f9fa;
          transform: translateY(-1px);
        }

        .menu-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .menu-icon {
          color: #ffd93d;
        }

        .menu-text {
          font-weight: 500;
          color: #1e2761;
          font-size: 0.95rem;
        }

        .menu-arrow {
          color: #666;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .profile-container {
            padding: 0.75rem;
            padding-bottom: 80px; /* Also ensure space on mobile */
          }

          .profile-header-new {
            padding: 20px;
          }

          .profile-details h1 {
            font-size: 1.25rem;
          }

          .highlights-container {
            gap: 16px;
          }

          .highlight-number {
            font-size: 1.8rem;
          }

          .metric-content:hover {
            margin: 0;
            padding: 16px 0;
            background: none;
          }
        }

        @media (max-width: 480px) {
          .profile-avatar,
          .profile-avatar-display {
            width: 45px;
            height: 45px;
          }

          .insights-card,
          .highlights-card,
          .vehicle-card {
            padding: 20px;
          }

          .highlights-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;

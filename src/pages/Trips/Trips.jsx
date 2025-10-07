import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Star,
  TrendingUp,
  Activity,
  RefreshCw,
  Loader2,
} from "lucide-react";
import BottomDock from "../../components/BottomDock";
import Header from "../../components/Header/Header";
import { DriverStatusContext } from "../../context/DriverStatusContext";
import { useAuth } from "../../context/AuthContext";
import { getDriverTrips } from "../../services/tripService";
import "./Trips.css"; // Ensure this file exists and contains the necessary styles

function Trips({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState("trips");
  const { isOnline } = useContext(DriverStatusContext) || {};
  const { user} = useAuth() || {};
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalDistance: 0,
    avgRating: 0,
    totalTrips: 0
  });
  const navigate = useNavigate();

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const handleMenuClick = () => {
    console.log("Menu clicked!");
  };

  const handleNotificationClick = () => {
    console.log("Notifications clicked!");
  };

  console.log("Auth User:", user);
  

  // Fetch trips data from API
  const fetchTrips = async (refresh = false) => {
    if (!user.token) {
      setError("No authentication token available");
      setLoading(false);
      return;
    }

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters = {
        page: 1,
        limit: 50,
        status: 'completed',
        ...(selectedFilter !== 'all' && { paymentMethod: selectedFilter })
      };

      const response = await getDriverTrips(user.token, filters);
      
      if (response && response.trips) {
        setTrips(response.trips);
        if (response.summary) {
          setSummary(response.summary);
        }
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(err.message || "Failed to fetch trips");
      setTrips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load trips on component mount and when filter changes
  useEffect(() => {
    fetchTrips();
  }, [user.token, selectedFilter]);

  // Handle refresh
  const handleRefresh = () => {
    fetchTrips(true);
  };

  // Filter trips based on payment method (trips are already filtered by the API based on selectedFilter)
  const filteredTrips = trips;

  // Use summary data from API response or calculate from filtered trips
  const totalEarnings = summary.totalEarnings || filteredTrips.reduce((sum, trip) => sum + trip.fare, 0);
  const totalDistance = parseFloat(summary.totalDistance) || filteredTrips.reduce(
    (sum, trip) => sum + parseFloat(trip.distance.replace(' km', '')), 0
  );
  const avgRating = parseFloat(summary.avgRating) || (
    filteredTrips.length > 0
      ? filteredTrips.reduce((sum, trip) => sum + trip.rating, 0) / filteredTrips.length
      : 0
  );

  return (
    <div style={styles.appLayout}>
      {/* Button to go to /tribaal-info */}
   
      {/* Just the Header component - that's it! */}
      <Header
        notificationCount={5}
        onMenuClick={handleMenuClick}
        onNotificationClick={handleNotificationClick}
      />

      {/* Profile Content */}
      <div style={styles.profileContainer}>
        {/* Dashboard Section - New Chic Design */}
        <div style={styles.dashboardSection}>
          {/* Background Pattern */}
          <div style={styles.bgPattern1}></div>
          <div style={styles.bgPattern2}></div>

          <div style={styles.dashboardContent}>
           <div style={styles.dashboardHeader}>
  <div>
    <h1 style={styles.dashboardTitle}>Your Trips</h1>
    <p style={styles.dashboardSubtitle}>
      Track your daily performance
    </p>
  </div>
  <div style={styles.statusBadge}>
    <div
      style={{
        ...styles.statusDot,
        backgroundColor: isOnline ? "#4ade80" : "#ef4444",
        animation: isOnline ? "pulse 2s infinite" : "none",
      }}
    ></div>
    <span style={styles.statusText}>
      {isOnline ? "Online" : "Offline"}
    </span>
  </div>
</div>
{/* Add the link below the dashboardHeader */}
<div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0" }}>
  <a
    href="#"
    className="link-tribaal-link"
    onClick={(e) => {
      e.preventDefault();
      navigate("/tribaal-info");
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
    Link Tribaal
  </a>
  {/* Refresh Button */}
  <button
    onClick={handleRefresh}
    disabled={refreshing}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "white",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      cursor: refreshing ? "not-allowed" : "pointer",
      fontSize: "14px",
      fontWeight: "500",
      opacity: refreshing ? 0.7 : 1,
      marginLeft: "auto"
    }}
  >
    {refreshing ? (
      <Loader2 size={16} className="spinning" />
    ) : (
      <RefreshCw size={16} />
    )}
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
</div>
            {/* Stats Grid - Improved Layout */}
            <div style={styles.statsGrid}>
              {/* Earnings Card */}
              <div style={styles.statCard}>
                <div style={styles.statCardHeader}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    <TrendingUp color="#4ade80" size={24} />
                  </div>
                  <span style={{ ...styles.statBadge, color: "#4ade80" }}>
                    +12%
                  </span>
                </div>
                <div style={styles.statContent}>
                  <p style={styles.statLabel}>Total Earnings</p>
                  <p style={styles.statValue}>R{totalEarnings.toFixed(2)}</p>
                </div>
              </div>

              {/* Distance Card */}
              <div style={styles.statCard}>
                <div style={styles.statCardHeader}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <Activity color="#60a5fa" size={24} />
                  </div>
                  <span style={{ ...styles.statBadge, color: "#60a5fa" }}>
                    {filteredTrips.length} trips
                  </span>
                </div>
                <div style={styles.statContent}>
                  <p style={styles.statLabel}>Distance Covered</p>
                  <p style={styles.statValue}>
                    {totalDistance.toFixed(1)}
                    <span style={styles.statUnit}>km</span>
                  </p>
                </div>
              </div>

              {/* Rating Card */}
              <div style={styles.statCard}>
                <div style={styles.statCardHeader}>
                  <div
                    style={{
                      ...styles.statIcon,
                      backgroundColor: "rgba(251, 191, 36, 0.2)",
                    }}
                  >
                    <Star color="#fbbf24" size={24} fill="currentColor" />
                  </div>
                  <div style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        color="#fbbf24"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
                <div style={styles.statContent}>
                  <p style={styles.statLabel}>Average Rating</p>
                  <p style={styles.statValue}>
                    {avgRating.toFixed(1)}
                    <span style={styles.statUnit}>/5.0</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {[
            { id: "all", label: "All Trips" },
            { id: "cash", label: "Cash" },
            { id: "card", label: "Card" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              style={{
                ...styles.tab,
                ...(selectedFilter === tab.id
                  ? styles.tabActive
                  : styles.tabInactive),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trips List */}
        <div style={styles.tripsList}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <Loader2 size={48} color="#60a5fa" className="spinning" />
              <h3 style={styles.loadingTitle}>Loading trips...</h3>
              <p style={styles.loadingSubtitle}>Please wait while we fetch your trip history</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <MapPin size={48} color="#ef4444" />
              <h3 style={styles.errorTitle}>Error loading trips</h3>
              <p style={styles.errorSubtitle}>{error}</p>
              <button onClick={handleRefresh} style={styles.retryButton}>
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div style={styles.noTrips}>
              <MapPin size={48} color="#d1d5db" />
              <h3 style={styles.noTripsTitle}>No trips found</h3>
              <p style={styles.noTripsSubtitle}>
                {selectedFilter === 'all' 
                  ? "You haven't completed any trips yet" 
                  : `No ${selectedFilter} payment trips found`}
              </p>
            </div>
          ) : (
            filteredTrips.map((trip, index) => (
              <div key={`${trip.id}-${trip.date}-${trip.time}-${index}`} style={styles.tripItem}>
                <div style={styles.tripMain}>
                  {/* Header */}
                  <div style={styles.tripHeader}>
                    <span style={styles.tripId}>{trip.id}</span>
                    <span style={styles.tripDate}>{trip.date}</span>
                    <span style={styles.tripTime}>{trip.time}</span>
                  </div>

                  {/* Route */}
                  <div style={styles.tripRoute}>
                    <div style={styles.routePoint}>
                      <div
                        style={{ ...styles.locationDot, ...styles.startDot }}
                      ></div>
                      <span style={styles.locationText}>{trip.pickup}</span>
                    </div>
                    <div style={styles.routeConnector}></div>
                    <div style={styles.routePoint}>
                      <div
                        style={{ ...styles.locationDot, ...styles.endDot }}
                      ></div>
                      <span style={styles.locationText}>{trip.dropoff}</span>
                    </div>
                  </div>

                  {/* Trip Info & Payment */}
                  <div style={styles.tripBottom}>
                    <div style={styles.tripInfo}>
                      <div style={styles.infoItem}>
                        <Clock size={14} color="#475569" />
                        <span>{trip.duration}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <MapPin size={14} color="#475569" />
                        <span>{trip.distance}</span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div style={styles.paymentContainer}>
                      {trip.paymentMethod === "cash" ? (
                        <div style={styles.paymentCash}>
                          <Banknote size={16} />
                          <span>Cash</span>
                        </div>
                      ) : (
                        <div style={styles.paymentCard}>
                          <CreditCard size={16} />
                          <div style={styles.cardInfo}>
                            <span style={styles.cardType}>
                              {trip.cardType.toUpperCase()}
                            </span>
                            <span style={styles.cardNumber}>
                              {trip.cardNumber}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div style={styles.tripSidebar}>
                  <div style={styles.fareAmount}>R{trip.fare.toFixed(2)}</div>
                  <div style={styles.ratingDisplay}>
                    <Star size={14} fill="currentColor" />
                    <span>{trip.rating}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  appLayout: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  profileContainer: {
    padding: "16px",
    paddingBottom: "100px", // Space for bottom dock
    marginTop: "70px", // Account for fixed header height
  },
  dashboardSection: {
    background:
      "linear-gradient(135deg, #0f172a 0%,rgb(28 31 135)  50%, #0f172a 100%)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern1: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "256px",
    height: "256px",
    opacity: 0.1,
    border: "2px solid white",
    borderRadius: "50%",
  },
  bgPattern2: {
    position: "absolute",
    top: "-128px",
    right: "-128px",
    width: "256px",
    height: "256px",
    opacity: 0.05,
    border: "2px solid white",
    borderRadius: "50%",
  },
  dashboardContent: {
    position: "relative",
    zIndex: 10,
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  dashboardTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 8px 0",
  },
  dashboardSubtitle: {
    color: "rgba(196, 181, 253, 0.8)",
    fontSize: "14px",
    margin: 0,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    padding: "8px 16px",
    borderRadius: "20px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  statusText: {
    fontSize: "14px",
    fontWeight: "500",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  statCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  statIcon: {
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statBadge: {
    fontSize: "14px",
    fontWeight: "500",
  },
  ratingStars: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "600",
    margin: 0,
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: 0,
  },
  statUnit: {
    fontSize: "18px",
    fontWeight: "normal",
    color: "rgba(255, 255, 255, 0.7)",
  },
  filterTabs: {
    display: "flex",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "6px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
  },
  tab: {
    flex: 1,
    padding: "12px 20px",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "14px",
  },
  tabActive: {
    backgroundColor: "#fbbf24",
    color: "#0f172a",
    boxShadow: "0 10px 25px rgba(251, 191, 36, 0.25)",
  },
  tabInactive: {
    backgroundColor: "transparent",
    color: "#6b7280",
    ":hover": {
      backgroundColor: "#f9fafb",
      color: "#0f172a",
    },
  },
  tripsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },
  loadingTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: "16px 0 8px 0",
  },
  loadingSubtitle: {
    color: "#6b7280",
    margin: 0,
  },
  errorContainer: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
  },
  errorTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#dc2626",
    margin: "16px 0 8px 0",
  },
  errorSubtitle: {
    color: "#7f1d1d",
    margin: "0 0 16px 0",
  },
  retryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  noTrips: {
    textAlign: "center",
    padding: "64px 20px",
    backgroundColor: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },
  noTripsTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
    margin: "16px 0 8px 0",
  },
  noTripsSubtitle: {
    color: "#6b7280",
    margin: 0,
  },
  tripItem: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e5e7eb",
    display: "flex",
    gap: "24px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
  },
  tripMain: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  tripHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
  },
  tripId: {
    padding: "6px 12px",
    backgroundColor: "#f3f4f6",
    color: "#111827",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  tripDate: {
    padding: "6px 12px",
    backgroundColor: "#fbbf24",
    color: "#0f172a",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  tripTime: {
    fontSize: "14px",
    color: "#6b7280",
    marginLeft: "auto",
  },
  tripRoute: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  routePoint: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  locationDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  startDot: {
    backgroundColor: "#22c55e",
    boxShadow: "0 0 10px rgba(34, 197, 94, 0.4)",
  },
  endDot: {
    backgroundColor: "#ef4444",
    boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)",
  },
  routeConnector: {
    width: "2px",
    height: "20px",
    background: "linear-gradient(to bottom, #22c55e, #ef4444)",
    marginLeft: "5px",
    borderRadius: "1px",
  },
  locationText: {
    fontWeight: "600",
    color: "#111827",
  },
  tripBottom: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  tripInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  paymentContainer: {
    display: "flex",
    alignItems: "center",
  },
  paymentCash: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "white",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
  },
  paymentCard: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "linear-gradient(135deg, #475569, #334155)",
    color: "white",
    borderRadius: "12px",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
  },
  cardType: {
    fontSize: "11px",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  cardNumber: {
    fontSize: "11px",
    fontFamily: "monospace",
  },
  tripSidebar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: "120px",
    gap: "16px",
  },
  fareAmount: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#22c55e",
  },
  ratingDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#fbbf24",
    color: "#0f172a",
    padding: "6px 10px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "bold",
  },
};

export default Trips;

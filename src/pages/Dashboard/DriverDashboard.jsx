import React, { useState, useEffect, useContext } from "react";
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  User,
  Bell,
  Settings,
  Menu,
  AlertTriangle,
  AlertOctagon,
  Ban,
  Navigation2,
  RotateCcw,
  History,
  MessageCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Phone,
  Send,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Calendar,
} from "lucide-react";
import BottomDock from "../../components/BottomDock";
import RideRequestHandler from "../../components/RideRequestHandler/RideRequestHandler"; // New component we'll create
import "./DriverDashboard.css";

import NotificationService from "../../services/NotificationService";
import vayeLogo from "../../assets/images/VayeLogoB.png";
import { useSpring, animated } from "react-spring";
import DashboardMap from "../../components/DashboardMap";
import { DriverStatusContext } from "../../context/DriverStatusContext"; // <-- add this import
import {
  getNearbyRequests,
  acceptRideRequest,
  setDriverAvailability,
} from "../../services/requestService";
import RideRequest from "../../components/RideRequest";
import { useAuth } from "../../context/AuthContext"; //get user data from context

function mapApiRideToRequest(apiRide) {
  return {
    isCarpool: false,
    estimatedPrice: apiRide.estimatedPrice || "",
    passengers: [
      {
        id: apiRide.rider._id,
        name: apiRide.rider.fullName,
        rating: apiRide.rider.averageRating,
        phoneNumber: apiRide.rider.phoneNumber || "",
      },
    ],
    stops: [
      {
        location: apiRide.pickup.address,
        passengerName: apiRide.rider.fullName,
        estimatedPrice: null,
      },
      {
        location: apiRide.dropoff.address,
        passengerName: apiRide.rider.fullName,
        estimatedPrice: null,
      },
    ],
    estimatedTotalDistance: apiRide.estimatedTotalDistance || "",
    estimatedTotalDuration: apiRide.estimatedTotalDuration || "",
    _id: apiRide._id, // Keep the original id for accept/decline
  };
}

function DriverDashboard({ onLogout = () => {} }) {
  // // Use context, fallback to local state if context is undefined
  // const driverStatus = useContext(DriverStatusContext);
  // const [localOnline, setLocalOnline] = useState(false);
  // const isOnline = driverStatus?.isOnline ?? localOnline;
  // const setIsOnline = driverStatus?.setIsOnline ?? setLocalOnline;

  const [isOnline, setIsOnline] = useState(false); // Local state for online status

  const [activeTab, setActiveTab] = useState("dashboard");
  const [earnings, setEarnings] = useState(2847);
  const [trips, setTrips] = useState(23);
  const [hours, setHours] = useState(8.5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -26.2041, lng: 28.0473 }); // Johannesburg coordinates
  const [transitioning, setTransitioning] = useState(false);

  // Dynamic Island Modal States
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [earningsModalIndex, setEarningsModalIndex] = useState(0); // 0: Today, 1: Last Trip, 2: Vaye Pro

  // Sample data for the modals
  const [lastTripData] = useState({
    amount: 145.5,
    date: "10 May",
    time: "19:03",
    points: 5,
    isVayeGo: true,
  });

  const [vayeProData] = useState({
    currentPoints: 127,
    totalPoints: 200,
    nextTier: "Gold",
    pointsNeeded: 73,
  });

  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [longPressInterval, setLongPressInterval] = useState(null);

  //Ride Request State
  const [rideRequests, setRideRequests] = useState([]); // Store all requests
  const [pollingInterval, setPollingInterval] = useState(null);
  const [requestTimer, setRequestTimer] = useState(20); // seconds to respond
  const [showRequest, setShowRequest] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [declinedRequestIds, setDeclinedRequestIds] = useState([]);

  // NEW STATE for new features only
  const [showMapReport, setShowMapReport] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const { user } = useAuth(); // Get user data from context

  //ride request handling
  useEffect(() => {
    let intervalId;
    let timerId;

    const token = user?.token;

    const pollRequests = async () => {
      try {
        const requests = await getNearbyRequests(token);
        if (requests && requests.length > 0) {
          // Filter out declined requests
          const filteredRequests = requests.filter(
            (r) => !declinedRequestIds.includes(r._id)
          );
          setRideRequests((prev) => {
            const existingIds = prev.map((r) => r._id);
            const newOnes = filteredRequests.filter(
              (r) => !existingIds.includes(r._id)
            );
            return [...prev, ...newOnes];
          });

          if (filteredRequests.length > 0) {
            setShowRequest(true);
            setRequestTimer(20); // Reset timer
            if (intervalId) clearInterval(intervalId); // Prevent overlap
            setPollingInterval(null);

            // Start countdown timer for request
            timerId = setInterval(() => {
              setRequestTimer((prev) => {
                if (prev <= 1) {
                  setShowRequest(false);
                  clearInterval(timerId);
                  intervalId = setInterval(pollRequests, 4000); // Resume polling
                  setPollingInterval(intervalId);
                  return 20;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    // Always clear previous interval before starting a new one
    if (isOnline) {
      if (pollingInterval) clearInterval(pollingInterval);
      intervalId = setInterval(pollRequests, 4000); // Poll every 4 seconds
      setPollingInterval(intervalId);
    } else {
      setShowRequest(false);
      if (pollingInterval) clearInterval(pollingInterval);
      if (timerId) clearInterval(timerId);
      setPollingInterval(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line
  }, [isOnline, declinedRequestIds]);

  // Show the first request in the queue
  const currentRequest = rideRequests.length > 0 ? rideRequests[0] : null;

  // Accept handler
  const handleAcceptRequest = async () => {
    const token = user?.token;
    try {
      const response = await acceptRideRequest(currentRequest._id, token);
      setRideRequests((prev) => prev.slice(1)); // Remove the first request
      setShowRequest(false);

      // Store the accepted ride for navigation
      if (response && response.ride) {
        setActiveTrip(response.ride);
      }

      if (pollingInterval) clearInterval(pollingInterval);
    } catch (err) {
      setRideRequests((prev) => prev.slice(1));
      setShowRequest(false);
    }
  };
  console.log("Current trip:", activeTrip);
  // Decline handler
  const handleDeclineRequest = () => {
    const token = user?.token;
    if (currentRequest) {
      setDeclinedRequestIds((prev) => [...prev, currentRequest._id]);
    }
    setRideRequests((prev) => prev.slice(1)); // Remove the first request
    setShowRequest(false);
    // Resume polling if no more requests
    if (rideRequests.length <= 1) {
      if (pollingInterval) clearInterval(pollingInterval);
      const intervalId = setInterval(() => getNearbyRequests(token), 4000);
      setPollingInterval(intervalId);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus !== isOnline) {
      setTransitioning(true);
      setTimeout(() => {
        setIsOnline(newStatus);
        setTimeout(() => {
          setTransitioning(false);
        }, 300);
      }, 300);
    }
  };

  const handleGoButtonMouseDown = () => {
    if (isOnline) {
      // If online, just go offline immediately
      toggleOnlineStatus();
      return;
    }

    // Start long press for going online
    setIsLongPressing(true);
    setLongPressProgress(0);

    const interval = setInterval(() => {
      setLongPressProgress((prev) => {
        const newProgress = prev + 2; // 2% every 20ms = 1 second total
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsLongPressing(false);
          setLongPressProgress(0);
          toggleOnlineStatus();
          return 100;
        }
        return newProgress;
      });
    }, 20);

    setLongPressInterval(interval);
  };

  const handleGoButtonMouseUp = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval);
      setLongPressInterval(null);
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  };

  const handleGoButtonMouseLeave = () => {
    if (longPressInterval) {
      clearInterval(longPressInterval);
      setLongPressInterval(null);
    }
    setIsLongPressing(false);
    setLongPressProgress(0);
  };

  // Add location tracking and restore online status
  useEffect(() => {
    // Restore online status from localStorage
    const savedStatus = localStorage.getItem("driverOnlineStatus");
    if (savedStatus === "true") {
      setIsOnline(true);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      navigator.geolocation.watchPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
    }
  }, [isOnline]);

  // Request notification permissions when component mounts
  useEffect(() => {
    const setupNotifications = async () => {
      const granted = await NotificationService.requestPermissions();
      setNotificationsEnabled(granted);
    };
    setupNotifications();
  }, []);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    handleStatusChange(newStatus);

    // Save to localStorage
    localStorage.setItem("driverOnlineStatus", newStatus.toString());

    // Update driver availability on backend
    try {
      const response = await setDriverAvailability(user?.token, newStatus);
      // If backend returns the user object, sync isOnline with isAvailable
      if (response && response.user && response.user.driverDetails) {
        setIsOnline(response.user.driverDetails.isAvailable);
      } else {
        setIsOnline(newStatus); // fallback
      }
    } catch (err) {
      // Optionally show error or revert UI
      console.error("Failed to update availability:", err);
      setIsOnline(!newStatus); // revert on error
    }

    if (newStatus && !notificationsEnabled) {
      NotificationService.requestPermissions().then((granted) =>
        setNotificationsEnabled(granted)
      );
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
    console.log("Switched to tab:", tabId);
  };

  // Dynamic Island Modal Handlers
  const handleEarningsClick = () => {
    setShowEarningsModal(true);
    setEarningsModalIndex(0); // Start with Today view
  };

  const handleModalNavigation = (direction) => {
    if (direction === "next") {
      setEarningsModalIndex((prev) => (prev + 1) % 3);
    } else {
      setEarningsModalIndex((prev) => (prev - 1 + 3) % 3);
    }
  };

  const closeEarningsModal = () => {
    setShowEarningsModal(false);
    setEarningsModalIndex(0);
  };

  // NEW HANDLERS for new features only
  const handleChatClick = () => {
    setShowChatModal(true);
    console.log("Opening chat with passenger...");
  };

  const handleStatsClick = () => {
    setShowStatsModal(true);
    console.log("Opening detailed stats...");
  };

  // Render Dynamic Island Modal Content
  const renderModalContent = () => {
    switch (earningsModalIndex) {
      case 0: // Today's Earnings
        return (
          <div className="dynamic-island-content">
            <div className="modal-header-simple">
              <span className="earnings-amount-large">
                R{earnings.toFixed(2)}
              </span>
              <span className="earnings-period">TODAY</span>
            </div>
            <div className="earnings-stats-simple">
              <div className="stat-row">
                <span className="stat-number">{trips}</span>
                <span className="stat-text">trips completed</span>
              </div>
              <div className="stat-row">
                <span className="stat-number">{hours}h</span>
                <span className="stat-text">online time</span>
              </div>
            </div>
          </div>
        );

      case 1: // Last Trip
        return (
          <div className="dynamic-island-content">
            <div className="modal-header-simple">
              <span className="earnings-amount-large">
                R{lastTripData.amount.toFixed(2)}
              </span>
              <span className="earnings-period">LAST TRIP</span>
            </div>
            <div className="trip-details">
              <div className="trip-info">
                <Calendar size={16} />
                <span>
                  {lastTripData.date} • {lastTripData.time}
                </span>
              </div>
              {lastTripData.isVayeGo && (
                <div className="points-earned">
                  <Star size={16} fill="currentColor" />
                  <span>{lastTripData.points} points earned</span>
                </div>
              )}
            </div>
            <button className="action-button">See Earnings Activity</button>
          </div>
        );

      case 2: // Vaye Pro
        return (
          <div className="dynamic-island-content">
            <div className="modal-header-simple">
              <div className="pro-header">
                <Award size={24} color="var(--color-primary)" />
                <span className="pro-title">Vaye Pro</span>
              </div>
            </div>
            <div className="pro-content">
              <div className="points-display">
                <span className="points-number">
                  {vayeProData.currentPoints}
                </span>
                <span className="points-text">points</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (vayeProData.currentPoints / vayeProData.totalPoints) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  Collect {vayeProData.pointsNeeded} more points to achieve{" "}
                  {vayeProData.nextTier}
                </span>
              </div>
            </div>
            <button className="action-button">See Progress</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {/* Map View - Always Visible */}
      <div className="map-container visible">
        <DashboardMap
          center={mapCenter}
          markers={[
            {
              position: mapCenter,
              icon: {
                url: "/driver-marker.png",
                scaledSize: { width: 40, height: 40 },
              },
            },
          ]}
          userToken={user?.token} // Pass user token for backend requests
          activeTrip={activeTrip} // Pass active trip for navigation
          //  onTripUpdate={(updatedTrip) => setActiveTrip(updatedTrip)}
        />
      </div>

      {/* Dynamic Island Earnings Display */}
      {/* <div
        className="earnings-display"
        onClick={handleEarningsClick}
      >
        <span className="earnings-amount">R{earnings.toFixed(2)}</span>
      </div> */}

      {/* Dynamic Island Modal */}
      {showEarningsModal && (
        <div className="dynamic-island-overlay" onClick={closeEarningsModal}>
          <div
            className="dynamic-island-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Arrows */}
            <button
              className="modal-nav-button left"
              onClick={() => handleModalNavigation("prev")}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className="modal-nav-button right"
              onClick={() => handleModalNavigation("next")}
            >
              <ChevronRight size={20} />
            </button>

            {/* Modal Content */}
            {renderModalContent()}

            {/* Page Indicators */}
            <div className="page-indicators">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`indicator ${
                    index === earningsModalIndex ? "active" : ""
                  }`}
                  onClick={() => setEarningsModalIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className="status-message">
        <div className={`status-dot ${isOnline ? "online" : "offline"}`}></div>
        <span>{isOnline ? "You're online" : "You're offline"}</span>
      </div>

      {/* Go Button */}
      <div className="go-button-container">
        <button
          className={`go-button ${isOnline ? "online" : "offline"} ${
            isLongPressing ? "pressing" : ""
          }`}
          onMouseDown={handleGoButtonMouseDown}
          onMouseUp={handleGoButtonMouseUp}
          onMouseLeave={handleGoButtonMouseLeave}
          onTouchStart={handleGoButtonMouseDown}
          onTouchEnd={handleGoButtonMouseUp}
        >
          {isLongPressing && (
            <div
              className="progress-circle"
              style={{
                background: `conic-gradient(var(--color-success) ${
                  longPressProgress * 3.6
                }deg, transparent 0deg)`,
              }}
            ></div>
          )}
          <span className="go-text">{isOnline ? "Stop" : "Go"}</span>
        </button>
      </div>

      {/* Enhanced Floating Buttons Container - Right Side */}
      <div className="floating-buttons-container">
        {/* Map Report Button - Always Visible */}
        <button
          className="floating-button map-report-button"
          onClick={() => setShowMapReport(true)}
          title="Report Issue"
        >
          <AlertTriangle size={24} className="icon-pulse" />
        </button>

        {/* Chat Button - Only when online */}
        {isOnline && (
          <button
            className="floating-button chat-button"
            onClick={handleChatClick}
            title="Chat with Passenger"
          >
            <MessageCircle size={24} className="icon-pulse" />
          </button>
        )}

        {/* Stats Button - Only when online */}
        {isOnline && (
          <button
            className="floating-button stats-button"
            onClick={handleStatsClick}
            title="View Stats"
          >
            <BarChart3 size={24} className="icon-pulse" />
          </button>
        )}
      </div>

      {/* NEW: Chat Modal */}
      {showChatModal && (
        <div
          className="earnings-modal-overlay"
          onClick={() => setShowChatModal(false)}
        >
          <div className="earnings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="earnings-modal-header">
              <MessageCircle size={32} color="var(--color-primary)" />
            </div>
            <div className="earnings-modal-content">
              <h3>PASSENGER CHAT</h3>
              <div className="earnings-stats">
                <div className="stat-item">
                  <span className="stat-text">
                    Ready to communicate with your passenger
                  </span>
                </div>
                <div
                  style={{ display: "flex", gap: "12px", marginTop: "20px" }}
                >
                  <button
                    className="view-summary-btn"
                    style={{
                      flex: 1,
                      background: "var(--color-chat)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Send size={16} />
                    CHAT
                  </button>
                  <button
                    className="view-summary-btn"
                    style={{
                      flex: 1,
                      background: "var(--color-success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Phone size={16} />
                    CALL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Stats Modal */}
      {showStatsModal && (
        <div
          className="earnings-modal-overlay"
          onClick={() => setShowStatsModal(false)}
        >
          <div className="earnings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="earnings-modal-header">
              <BarChart3 size={32} color="var(--color-primary)" />
            </div>
            <div className="earnings-modal-content">
              <h3>LIVE STATS</h3>
              <div className="earnings-stats">
                <div className="stat-item">
                  <span className="stat-number">{trips}</span>
                  <span className="stat-text">trips today</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{hours}h</span>
                  <span className="stat-text">online time</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">4.9★</span>
                  <span className="stat-text">rating</span>
                </div>
              </div>
              <button
                className="view-summary-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <TrendingUp size={16} />
                VIEW DETAILED ANALYTICS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Enhanced Map Report Drawer */}
      {showMapReport && (
        <div
          className="map-report-overlay"
          onClick={() => setShowMapReport(false)}
        >
          <div
            className="map-report-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="drawer-title">Add a map report</h3>

            <div className="report-options">
              <button className="report-option">
                <AlertTriangle size={24} color="#ff6b47" />
                <span>Traffic</span>
              </button>
              <button className="report-option">
                <AlertOctagon size={24} color="#e74c3c" />
                <span>Accident</span>
              </button>
              <button className="report-option">
                <Ban size={24} color="#95a5a6" />
                <span>Road Closure</span>
              </button>
              <button className="report-option">
                <Navigation2 size={24} color="#3498db" />
                <span>Speed Trap</span>
              </button>
              <button className="report-option">
                <RotateCcw size={24} color="#f39c12" />
                <span>Wrong Direction</span>
              </button>
              {/* <button className="report-option">
                <Activity size={24} color="#9b59b6" />
                <span>Other</span>
              </button> */}
            </div>

            <div className="contributions-section">
              <button className="contributions-button">
                <History size={20} color="#04050aff" />
                <span>My Contributions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ride Request Handler Component - Only when online */}
      {showRequest && currentRequest && (
        <RideRequest
          request={currentRequest}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          timeRemaining={requestTimer}
        />
      )}

      {/* Bottom Navigation Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />
    </div>
  );
}

export default DriverDashboard;

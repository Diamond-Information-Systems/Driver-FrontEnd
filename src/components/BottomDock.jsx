import React, { useState, useContext, useEffect } from "react";
import {
  Home,
  MapPin,
  DollarSign,
  User,
  Settings,
  Navigation,
  Clock,
  BarChart3,
  MessageCircle,
  LogOut,
  Inbox,
  Share2,
  Wallet as WalletIcon,
  UserCog,
  HelpCircle,
  Smartphone, // Add this for App Settings
} from "lucide-react";
import { Badge } from "antd";
import { useNavigate } from "react-router-dom";
import "./BottomDock.css";
import { DriverStatusContext } from "../context/DriverStatusContext";

const BottomDock = ({
  activeTab = "dashboard",
  onTabChange,
  quickActions = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { isOnline } = useContext(DriverStatusContext) || {};

  // Debug log
  useEffect(() => {
    console.log("BottomDock isOnline:", isOnline);
  }, [isOnline]);

  const mainTabs = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dash",
      color: "#4facfe",
    },
    {
      id: "trips",
      icon: MapPin,
      label: "Trips",
      color: "#51cf66",
      badge: isOnline === true ? "Live" : null,
    },
    // {
    //   id: "earnings",
    //   icon: DollarSign,
    //   label: "Earnings",
    //   color: "#ffd43b",
    // },
    // {
    //   id: "profile",
    //   icon: User,
    //   label: "Profile",
    //   color: "#a78bfa",
    // },
  ];

  const expandedActions = [
    {
      id: "inbox",
      icon: Inbox,
      label: "Inbox",
      color: "red",
      badge: "2",
      badgeColor: "red",
      route: "/inbox",
    },
    {
      id: "referrals",
      icon: Share2,
      label: "Referrals",
      color: "#51cf66",
      route: "/referrals",
    },
    {
      id: "wallet",
      icon: WalletIcon,
      label: "Wallet",
      color: "#FFD600",
      route: "/wallet",
    },
    {
      id: "account",
      icon: UserCog,
      label: "Account",
      color: "#4facfe",
      route: "/account",
    },
    {
      id: "app-settings",
      icon: Smartphone,
      label: "App Settings",
      color: "#a78bfa",
      route: "/app-settings", // Navigate to app settings page
    },
    {
      id: "help",
      icon: HelpCircle,
      label: "Help",
      color: "#6c757d",
      small: true,
      route: "/help",
    },
    {
      id: "logout",
      icon: LogOut,
      label: "Logout",
      color: "#343a40",
    },
  ];

  // Map tab/action ids to route paths
  const tabRoutes = {
    dashboard: "/dashboard",
    trips: "/trips",
    earnings: "/earnings",
    profile: "/profile",
    account: "/account",
    logout: "/",
  };

  const handleTabPress = (tabId) => {
    if (tabId === "more") {
      setIsExpanded(!isExpanded);
    } else {
      onTabChange?.(tabId);
      setIsExpanded(false);
      if (tabRoutes[tabId]) {
        navigate(tabRoutes[tabId]);
      }
    }
  };

  const handleQuickAction = (actionId) => {
    onTabChange?.(actionId);
    setIsExpanded(false);

    // Find the action object by id
    const action = expandedActions.find((a) => a.id === actionId);

    // Handle special logout action
    if (actionId === "logout") {
      // Add your logout logic here
      console.log("Logout clicked");
      navigate("/");
      return;
    }

    // Prefer action.route, fallback to tabRoutes
    if (action?.route) {
      navigate(action.route);
    } else if (tabRoutes[actionId]) {
      navigate(tabRoutes[actionId]);
    }
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div className="dock-backdrop" onClick={() => setIsExpanded(false)} />
      )}

      {/* Expanded Actions Panel */}
      {isExpanded && (
        <div className="dock-expanded">
          <div className="dock-expanded-content">
            <h3 className="dock-expanded-title">Quick Actions</h3>
            <div className="dock-expanded-grid">
              {expandedActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    className={`dock-expanded-item ${
                      action.small ? "small-text" : ""
                    }`}
                    onClick={() => handleQuickAction(action.id)}
                    style={{ "--action-color": action.color }}
                  >
                    <div className="dock-expanded-icon">
                      {action.badge ? (
                        <Badge count={action.badge} color={action.badgeColor}>
                          <action.icon size={24} />
                        </Badge>
                      ) : (
                        <action.icon size={24} />
                      )}
                    </div>
                    <span className="dock-expanded-label">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Dock Bar */}
      <div className="bottom-dock">
        <div className="dock-container">
          {/* Main Navigation Tabs */}
          <div className="dock-tabs">
            {mainTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  className={`dock-tab ${isActive ? "dock-tab-active" : ""}`}
                  onClick={() => handleTabPress(tab.id)}
                  style={{ "--tab-color": tab.color }}
                >
                  <div className="dock-tab-icon">
                    <IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.badge && (
                      <span className="dock-tab-badge">{tab.badge}</span>
                    )}
                  </div>
                  <span className="dock-tab-label">{tab.label}</span>
                  {isActive && <div className="dock-tab-indicator" />}
                </button>
              );
            })}

            {/* More/Settings Button */}
            <button
              className={`dock-tab dock-tab-more ${
                isExpanded ? "dock-tab-active" : ""
              }`}
              onClick={() => handleTabPress("more")}
            >
              <div className="dock-tab-icon">
                <div
                  className={`dock-more-icon ${isExpanded ? "rotated" : ""}`}
                >
                  <Settings size={24} strokeWidth={isExpanded ? 2.5 : 2} />
                </div>
              </div>
              <span className="dock-tab-label">More</span>
              {isExpanded && <div className="dock-tab-indicator" />}
            </button>
          </div>

          {/* Online Status Indicator */}
          <div className="dock-status">
            <div
              className={`dock-status-dot ${isOnline ? "online" : "offline"}`}
            />
          </div>
        </div>

        {/* Safe Area Bottom Padding */}
        <div className="dock-safe-area" />
      </div>
    </>
  );
};

export default BottomDock;
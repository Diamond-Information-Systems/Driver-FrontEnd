import React from "react";
import {
  X,
  Car,
  Briefcase,
  FileText,
  CreditCard,
  Calculator,
  User,
  MapPin,
  Lock,
  Shield,
  Settings,
  Info,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomDock from "../../components/BottomDock";
import "./Account.css";

const Account = () => {
  const navigate = useNavigate();

  const accountItems = [
    {
      id: "vehicles",
      icon: Car,
      title: "Vehicles",
      subtitle: "Toyota Agya KT38PZGP",
      route: "/account/vehicles",
    },
    {
      id: "work-hub",
      icon: Briefcase,
      title: "Work Hub",
      route: "/account/work-hub",
    },
    {
      id: "documents",
      icon: FileText,
      title: "Documents",
      route: "/account/documents",
    },
    {
      id: "payment",
      icon: CreditCard,
      title: "Payment",
      route: "/account/payment",
    },
    {
      id: "tax-info",
      icon: Calculator,
      title: "Tax info",
      route: "/account/tax-info",
    },
    {
      id: "manage-account",
      icon: User,
      title: "Manage Vaye account",
      route: "/account/manage",
    },
    {
      id: "edit-address",
      icon: MapPin,
      title: "Edit address",
      route: "/account/address",
    },
    {
      id: "privacy",
      icon: Lock,
      title: "Privacy",
      route: "/account/privacy",
    },
    {
      id: "security",
      icon: Shield,
      title: "Security",
      route: "/account/security",
    },
    // {
    //   id: "app-settings",
    //   icon: Settings,
    //   title: "App settings",
    //   route: "/account/app-settings",
    // },
    {
      id: "about",
      icon: Info,
      title: "About",
      route: "/account/about",
    },
  ];

  const handleItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="account-page">
      {/* Header */}
      <div className="account-header">
        <button className="account-back-btn" onClick={handleBackClick}>
          <X size={24} />
        </button>
        <h1 className="account-title">Account</h1>
      </div>

      {/* Account Menu Items */}
      <div className="account-content">
        <div className="account-menu">
          {accountItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className="account-menu-item"
                onClick={() => handleItemClick(item)}
              >
                <div className="account-menu-left">
                  <div className="account-menu-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="account-menu-text">
                    <span className="account-menu-title">{item.title}</span>
                    {item.subtitle && (
                      <span className="account-menu-subtitle">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="account-menu-arrow">
                  <ChevronRight size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Dock Navigation */}
      <BottomDock activeTab="profile" />
    </div>
  );
};

export default Account;
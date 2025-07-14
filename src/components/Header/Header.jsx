import React from 'react';
import { Menu, Bell } from 'lucide-react';
import './Header.css';
import VayeLogo from "../../assets/images/VayeLogoB.png"
const Header = ({ 
    logoSrc = VayeLogo, 
  logoAlt = "Logo", 
  notificationCount = 0,
  onMenuClick,
  onNotificationClick 
}) => {
  return (
    <div className="app-header">
      {/* Left Side - Menu */}
      <div className="header-left">
        {/* <button className="header-menu-button" onClick={onMenuClick}>
          <Menu size={24} />
        </button> */}
      </div>

      {/* Center - Logo */}
      <div className="header-logo-container">
        <img 
          src={logoSrc} 
          alt={logoAlt} 
          className="header-logo"
        />
      </div>

      {/* Right Side - Notifications */}
      <div className="header-right">
        <button className="notification-button" onClick={onNotificationClick}>
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="notification-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
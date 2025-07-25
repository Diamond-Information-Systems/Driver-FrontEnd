import React from 'react';
import {
  Volume2,
  Navigation,
  Accessibility,
  MessageCircle,
  Moon,
  Lock,
  MapPin,
  Phone,
  Gauge,
  Video,
  ChevronRight,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppSettingsPage = ({ onBack, onMenuItemClick }) => {
   const navigate = useNavigate();


  const settingsItems = [
    {
      id: 'sounds-voice',
      icon: Volume2,
      title: 'Sounds & Voice',
      description: 'Audio alerts, voice guidance, and notification sounds',
      color: '#4facfe',
      route: '/app-settings/sounds-voice'
    },
    {
      id: 'navigation',
      icon: Navigation,
      title: 'Navigation',
      description: 'Route preferences, map display, and GPS settings',
      color: '#51cf66',
      route: '/app-settings/navigation'
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      title: 'Accessibility',
      description: 'Font size, contrast, and accessibility features',
      color: '#ffd43b',
      route: '/app-settings/accessibility'
    },
    {
      id: 'communication',
      icon: MessageCircle,
      title: 'Communication',
      description: 'Chat settings, auto-responses, and messaging',
      color: '#ff6b6b',
      route: '/app-settings/communication'
    },
    {
      id: 'night-mode',
      icon: Moon,
      title: 'Night Mode',
      description: 'Dark theme and low-light display settings',
      color: '#a78bfa',
      route: '/app-settings/night-mode'
    },
    {
      id: 'pin-verification',
      icon: Lock,
      title: 'Pin Verification',
      description: 'Trip confirmation and security PIN settings',
      color: '#4facfe',
      route: '/app-settings/pin-verification'
    },
    {
      id: 'follow-my-trip',
      icon: MapPin,
      title: 'Follow my Trip',
      description: 'Trip sharing and real-time location features',
      color: '#51cf66',
      route: '/app-settings/follow-my-trip'
    },
    {
      id: 'emergency-contacts',
      icon: Phone,
      title: 'Emergency Contacts',
      description: 'Add and manage emergency contact information',
      color: '#ff6b6b',
      route: '/app-settings/emergency-contacts'
    },
    {
      id: 'speed-limit',
      icon: Gauge,
      title: 'Speed Limit',
      description: 'Speed alerts, warnings, and limit notifications',
      color: '#ffd43b',
      route: '/app-settings/speed-limit'
    },
    {
      id: 'video-recording',
      icon: Video,
      title: 'Video Recording',
      description: 'Trip recording, dash cam, and video settings',
      color: '#a78bfa',
      route: '/app-settings/video-recording'
    }
  ];

 const handleMenuClick = (item) => {
  // Navigate if route exists
  if (item.route) {
    navigate(item.route);
  }
  
  // Still call the optional callback with the item id
  onMenuItemClick?.(item.id);
};

  const handleBackClick = () => {
    //navigate(-1); // Go back to previous page
      navigate('/dashboard'); // Go to specific page
    // OR onBack?.(); // Use the onBack prop if provided
  };

  return (
    <>
      <style jsx>{`
        /* App Settings Page Styles */
        .app-settings-page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
        }

        /* Header */
        .app-settings-page-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          width: 100%;
        }

        .app-settings-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(100, 116, 139, 0.1);
          border: none;
          border-radius: 12px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .app-settings-back-btn:hover {
          background: rgba(100, 116, 139, 0.2);
          color: #475569;
          transform: scale(1.05);
        }

        .app-settings-header-content-area {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .app-settings-page-title h1 {
          margin: 0;
          margin-left: 8px;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e2761;
        }

        .app-settings-header-spacer {
          width: 40px;
          height: 40px;
        }

        /* Content */
        .app-settings-page-main-content {
          padding: 20px 20px 24px 20px;
        }

        .app-settings-page-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
          text-align: center;
          margin-bottom: 24px;
        }

        .app-settings-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;  /* Increased gap between items */
        }

        /* Settings Items */
        .app-settings-menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;  /* Increased padding */
          background: white;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          width: 100%;
          border: none;  /* Removed border for all items */
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);  /* Added shadow to all items */
        }

        .app-settings-menu-item:hover {
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }

        .app-settings-menu-item-left {
          display: flex;
          align-items: center;
          gap: 18px;  /* Increased gap */
          flex: 1;
        }

        .app-settings-menu-item-icon {
          padding: 14px;  /* Increased icon padding */
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--item-color, #4facfe);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .app-settings-menu-item:hover .app-settings-menu-item-icon {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .app-settings-menu-item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;  /* Increased gap */
        }

        .app-settings-menu-item-title {
          font-size: 1.05rem;  /* Slightly larger */
          font-weight: 600;
          color: #1e2761;
          line-height: 1.2;
        }

        .app-settings-menu-item-description {
          font-size: 0.9rem;  /* Slightly larger */
          color: #64748b;
          line-height: 1.3;
          font-weight: 500;
        }

        .app-settings-menu-item-arrow {
          color: #94a3b8;
          transition: all 0.3s ease;
          flex-shrink: 0;
          margin-left: 12px;  /* Added margin */
        }

        .app-settings-menu-item:hover .app-settings-menu-item-arrow {
          color: #64748b;
          transform: translateX(4px);
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .app-settings-page-header {
            padding: 12px 16px;
          }

          .page-header-content {
            gap: 10px;
          }

          .page-header-icon {
            padding: 8px;
          }

          .page-header-text h1 {
            font-size: 1.1rem;
          }

          .app-settings-page-content {
            padding: 16px 16px 20px 16px;
          }

          .app-settings-menu-item {
            padding: 18px 20px;  /* Still larger than original, but smaller than desktop */
          }

          .app-settings-menu-item-left {
            gap: 14px;
          }

          .app-settings-menu-item-icon {
            padding: 12px;
          }

          .app-settings-menu-item-title {
            font-size: 1rem;
          }

          .app-settings-menu-item-description {
            font-size: 0.85rem;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .settings-item,
          .settings-item-icon,
          .settings-item-arrow,
          .back-button {
            transition: none;
          }

          .settings-item:hover {
            transform: none;
          }

          .settings-item:hover .settings-item-icon {
            transform: none;
          }

          .settings-item:hover .settings-item-arrow {
            transform: none;
          }

          .back-button:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="app-settings-page-wrapper">
        {/* Header */}
        <div className="app-settings-page-header-container">
          <button className="app-settings-back-btn" onClick={handleBackClick}>
            <X size={20} />
          </button>
          
          <div className="app-settings-header-content-area">
            <div className="app-settings-page-title">
              <h1>App Settings</h1>
            </div>
          </div>
          
          <div className="app-settings-header-spacer"></div>
        </div>

        {/* Content */}
        <div className="app-settings-page-main-content">
          {/* <p className="app-settings-page-subtitle">Customize your driving experience</p> */}
          
          <div className="app-settings-items-list">
            {settingsItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  className="app-settings-menu-item"
                   onClick={() => handleMenuClick(item)} 
                  style={{ '--item-color': item.color }}
                >
                  <div className="app-settings-menu-item-left">
                    <div className="app-settings-menu-item-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="app-settings-menu-item-content">
                      <span className="app-settings-menu-item-title">{item.title}</span>
                      <span className="app-settings-menu-item-description">{item.description}</span>
                    </div>
                  </div>
                  <ChevronRight size={22} className="app-settings-menu-item-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSettingsPage;
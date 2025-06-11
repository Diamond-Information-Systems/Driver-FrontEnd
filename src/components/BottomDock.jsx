import React, { useState } from 'react';
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
  LogOut ,
} from 'lucide-react';
import './BottomDock.css';

const BottomDock = ({ 
  activeTab = 'dashboard', 
  onTabChange, 
  isOnline = false,
  quickActions = [] 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainTabs = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Dash',
      color: '#4facfe'
    },
    {
      id: 'trips',
      icon: MapPin,
      label: 'Trips',
      color: '#51cf66',
      badge: isOnline ? 'Live' : null
    },
    {
      id: 'earnings',
      icon: DollarSign,
      label: 'Earnings',
      color: '#ffd43b'
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      color: '#a78bfa'
    }
  ];

  const expandedActions = [
    {
      id: 'navigate',
      icon: Navigation,
      label: 'Navigate',
      color: '#4facfe'
    },
    {
      id: 'history',
      icon: Clock,
      label: 'History',
      color: '#6c757d'
    },
    {
      id: 'stats',
      icon: BarChart3,
      label: 'Stats',
      color: '#ff6b6b'
    },
    {
      id: 'support',
      icon: MessageCircle,
      label: 'Support',
      color: '#17a2b8'
    },
    {
      id: 'logout',
      icon: LogOut ,
      label: 'Logout',
      color: '#343a40'
    },

  ];

  const handleTabPress = (tabId) => {
    if (tabId === 'more') {
      setIsExpanded(!isExpanded);
    } else {
      onTabChange?.(tabId);
      setIsExpanded(false);
    }
  };

  const handleQuickAction = (actionId) => {
    onTabChange?.(actionId);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className="dock-backdrop"
          onClick={() => setIsExpanded(false)}
        />
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
                    className="dock-expanded-item"
                    onClick={() => handleQuickAction(action.id)}
                    style={{ '--action-color': action.color }}
                  >
                    <div className="dock-expanded-icon">
                      <IconComponent size={24} />
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
                  className={`dock-tab ${isActive ? 'dock-tab-active' : ''}`}
                  onClick={() => handleTabPress(tab.id)}
                  style={{ '--tab-color': tab.color }}
                >
                  <div className="dock-tab-icon">
                    <IconComponent 
                      size={24} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
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
              className={`dock-tab dock-tab-more ${isExpanded ? 'dock-tab-active' : ''}`}
              onClick={() => handleTabPress('more')}
            >
              <div className="dock-tab-icon">
                <div className={`dock-more-icon ${isExpanded ? 'rotated' : ''}`}>
                  <Settings size={24} strokeWidth={isExpanded ? 2.5 : 2} />
                </div>
              </div>
              <span className="dock-tab-label">More</span>
              {isExpanded && <div className="dock-tab-indicator" />}
            </button>
          </div>

          {/* Online Status Indicator */}
          <div className="dock-status">
            <div className={`dock-status-dot ${isOnline ? 'online' : 'offline'}`} />
          </div>
        </div>

        {/* Safe Area Bottom Padding */}
        <div className="dock-safe-area" />
      </div>
    </>
  );
};

export default BottomDock;
import React, { useState } from "react";
import Header from "../../components/Header/Header";
import BottomDock from "../../components/BottomDock";
import {
  Wallet,
  Calendar,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  Banknote,
  TrendingUp,
  Copy,
  Star,
  Zap,
  Shield,
  Award,
} from "lucide-react";

function WalletPage({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState("wallet");
  const [isOnline, setIsOnline] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked!');
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked!');
  };

  // Wallet Data
  const walletData = {
    currentBalance: 2847.50,
    pendingAmount: 425.75,
    totalEarnings: 45780.25,
    nextPayoutDate: "25 Jun",
    nextPayoutAmount: 2847.50
  };

  // Recent Payout Activity (last 2 weeks)
  const payoutHistory = [
    {
      id: 1,
      date: "18 Jun 2024",
      amount: 1250.00,
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY_001234",
      time: "14:30"
    },
    {
      id: 2,
      date: "11 Jun 2024", 
      amount: 1680.75,
      status: "completed",
      method: "Bank Transfer",
      reference: "PAY_001189",
      time: "09:15"
    },
    {
      id: 3,
      date: "4 Jun 2024",
      amount: 890.25,
      status: "completed", 
      method: "Bank Transfer",
      reference: "PAY_001145",
      time: "16:42"
    },
    {
      id: 4,
      date: "28 May 2024",
      amount: 2100.00,
      status: "failed",
      method: "Bank Transfer",
      reference: "PAY_001098",
      time: "11:20"
    }
  ];

  const copyReference = (reference) => {
    navigator.clipboard.writeText(reference);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      case 'failed':
        return <AlertCircle size={16} className="status-icon failed" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4ade80';
      case 'pending': return '#fbbf24';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="app-layout">
      <div className="wallet-scroll-container">
        <Header 
          notificationCount={5}
          onMenuClick={handleMenuClick}
          onNotificationClick={handleNotificationClick}
        />

        <div className="wallet-container">
          {/* 3D Wallet Card */}
          <div className="wallet-3d-container">
            <div className="wallet-3d">
              {/* Wallet Front Face */}
              <div className="wallet-front">
                {/* Stitching Details */}
                <div className="stitching-top"></div>
                <div className="stitching-bottom"></div>
                <div className="stitching-left"></div>
                <div className="stitching-right"></div>
                
                {/* Leather Texture Overlay */}
                <div className="leather-texture"></div>
                
                {/* Wallet Content */}
                <div className="wallet-content">
                  <div className="wallet-header">
                    <div className="wallet-title">
                      <Wallet size={24} className="wallet-icon" />
                      <span>Wallet</span>
                    </div>
                    <button
                      className="visibility-toggle"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                    >
                      {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>

                  <div className="balance-section">
                    <div className="current-balance">
                      <span className="balance-label">Available Balance</span>
                      <span className="balance-amount">
                        {balanceVisible
                          ? `R${walletData.currentBalance.toLocaleString("en-ZA", {
                              minimumFractionDigits: 2,
                            })}`
                          : "R••••••"}
                      </span>
                    </div>

                    <div className="pending-section">
                      <div className="pending-item">
                        <Clock size={16} />
                        <span>
                          Pending: {balanceVisible
                            ? `R${walletData.pendingAmount.toLocaleString("en-ZA", {
                                minimumFractionDigits: 2,
                              })}`
                            : "R••••"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="wallet-actions">
                    <button className="wallet-btn primary">
                      <ArrowUpFromLine size={18} />
                      <span>Cash Out</span>
                    </button>
                    <button className="wallet-btn secondary">
                      <TrendingUp size={18} />
                      <span>Earnings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wallet Edge/Side */}
              <div className="wallet-edge"></div>
            </div>
          </div>

          {/* Next Payout Schedule */}
          <div className="payout-schedule-card">
            <div className="card-header">
              <div className="header-left">
                <Calendar size={20} className="header-icon" />
                <h3>Payout Scheduled</h3>
              </div>
              <div className="payout-badge">
                <span>Auto</span>
              </div>
            </div>
            
            <div className="schedule-content">
              <div className="schedule-date">
                <span className="date-label">Next payout</span>
                <span className="date-value">{walletData.nextPayoutDate}</span>
              </div>
              <div className="schedule-amount">
                <span className="amount-label">Expected amount</span>
                <span className="amount-value">
                  {balanceVisible
                    ? `R${walletData.nextPayoutAmount.toLocaleString("en-ZA", {
                        minimumFractionDigits: 2,
                      })}`
                    : "R••••••"}
                </span>
              </div>
            </div>
          </div>

          {/* Payout Activity */}
          <div className="activity-section">
            <div className="section-header">
              <h3>Payout Activity</h3>
              <span className="activity-period">Last 2 weeks</span>
            </div>

            <div className="activity-list">
              {payoutHistory.map((payout) => (
                <div key={payout.id} className="activity-item">
                  <div className="activity-left">
                    <div className="activity-icon-wrapper">
                      {getStatusIcon(payout.status)}
                    </div>
                    <div className="activity-details">
                      <div className="activity-main">
                        <span className="activity-method">{payout.method}</span>
                        <span className="activity-time">{payout.time}</span>
                      </div>
                      <div className="activity-meta">
                        <span className="activity-date">{payout.date}</span>
                        <button 
                          className="reference-btn"
                          onClick={() => copyReference(payout.reference)}
                        >
                          <span>{payout.reference}</span>
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="activity-right">
                    <span className={`activity-amount ${payout.status === 'failed' ? 'failed' : ''}`}>
                      {payout.status === 'failed' ? '-' : '+'}R{payout.amount.toLocaleString("en-ZA", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span 
                      className="activity-status"
                      style={{ color: getStatusColor(payout.status) }}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="menu-section">
            <div className="menu-item payout-method-item" onClick={() => console.log('Navigate to Payout Method')}>
              <div className="menu-left">
                <div className="card-icon-container">
                  <div className="mastercard-logo">
                    <div className="card-circle red"></div>
                    <div className="card-circle yellow"></div>
                  </div>
                </div>
                <div className="menu-text-container">
                  <span className="menu-text">Payout Method</span>
                  <span className="connected-card">Mastercard •••• 4729</span>
                </div>
              </div>
              <ChevronRight size={20} className="menu-arrow" />
            </div>

            <div className="menu-item" onClick={() => console.log('Navigate to Help')}>
              <div className="menu-left">
                <HelpCircle size={20} className="menu-icon" />
                <span className="menu-text">Help & Support</span>
              </div>
              <ChevronRight size={20} className="menu-arrow" />
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-dock-fixed">
        <BottomDock
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOnline={isOnline}
        />
      </div>

      <style jsx>{`
        .app-layout {
          height: 100vh;
          overflow: hidden;
          background: #f8f9fa;
        }

        .wallet-scroll-container {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 90px;
        }

        .bottom-dock-fixed {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
        }

        .wallet-container {
          padding: 20px;
          margin-top: 70px;
          max-width: 100%;
        }

        /* 3D Wallet Container */
        .wallet-3d-container {
          perspective: 1000px;
          margin-bottom: 32px;
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }

        .wallet-3d {
          position: relative;
          width: 100%;
          max-width: 400px;
          height: 280px;
          transform-style: preserve-3d;
          transform: rotateX(5deg) rotateY(-5deg);
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .wallet-3d:hover {
          transform: rotateX(2deg) rotateY(-2deg) scale(1.02);
        }

        /* Wallet Front Face */
        .wallet-front {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2d1b69 0%, #1e2761 50%, #0f172a 100%);
          border-radius: 20px;
          padding: 32px 24px;
          color: white;
          transform: translateZ(20px);
          box-shadow: 
            0 25px 50px rgba(15, 23, 42, 0.4),
            inset 0 2px 4px rgba(255, 255, 255, 0.1),
            inset 0 -2px 4px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        /* Wallet Edge/Side */
        .wallet-edge {
          position: absolute;
          top: 0;
          right: -20px;
          width: 20px;
          height: 100%;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%);
          border-radius: 0 20px 20px 0;
          transform: rotateY(90deg) translateZ(0px);
          transform-origin: left center;
          box-shadow: 
            inset 2px 0 4px rgba(0, 0, 0, 0.3),
            inset -1px 0 2px rgba(255, 255, 255, 0.05);
        }

        /* Realistic Stitching */
        .stitching-top,
        .stitching-bottom,
        .stitching-left,
        .stitching-right {
          position: absolute;
          z-index: 2;
        }

        .stitching-top,
        .stitching-bottom {
          left: 15px;
          right: 15px;
          height: 2px;
          background: 
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 6px,
              rgba(255, 217, 61, 0.4) 6px,
              rgba(255, 217, 61, 0.4) 8px,
              transparent 8px,
              transparent 14px
            );
          border-radius: 1px;
        }

        .stitching-top {
          top: 12px;
        }

        .stitching-bottom {
          bottom: 12px;
        }

        .stitching-left,
        .stitching-right {
          top: 15px;
          bottom: 15px;
          width: 2px;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 6px,
              rgba(255, 217, 61, 0.4) 6px,
              rgba(255, 217, 61, 0.4) 8px,
              transparent 8px,
              transparent 14px
            );
          border-radius: 1px;
        }

        .stitching-left {
          left: 12px;
        }

        .stitching-right {
          right: 12px;
        }

        /* Leather Texture */
        .leather-texture {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.15;
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0),
            radial-gradient(circle at 8px 8px, rgba(0, 0, 0, 0.1) 0.5px, transparent 0),
            radial-gradient(circle at 15px 4px, rgba(255, 255, 255, 0.1) 0.5px, transparent 0);
          background-size: 20px 20px, 16px 16px, 24px 24px;
          background-position: 0 0, 4px 4px, 8px 2px;
          border-radius: 20px;
        }

        /* Enhanced Wallet Content */
        .wallet-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-top: 8px;
        }

        .wallet-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
          font-weight: 700;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 217, 61, 0.9);
        }

        .wallet-icon {
          opacity: 0.8;
        }

        .visibility-toggle {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 10px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .visibility-toggle:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }

        .balance-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .current-balance {
          margin-bottom: 16px;
        }

        .balance-label {
          display: block;
          font-size: 0.8rem;
          opacity: 0.7;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .balance-amount {
          display: block;
          font-size: 2.8rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #ffd93d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: -1px;
          line-height: 1;
        }

        .pending-section {
          display: flex;
          justify-content: center;
        }

        .pending-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .wallet-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-bottom: 8px;
        }

        .wallet-btn {
          padding: 14px 18px;
          border-radius: 14px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.9rem;
          position: relative;
          overflow: hidden;
        }

        .wallet-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .wallet-btn:hover::before {
          left: 100%;
        }

        .wallet-btn.primary {
          background: linear-gradient(135deg, #ffd93d 0%, #ffb800 100%);
          color: #1e2761;
          box-shadow: 
            0 4px 15px rgba(255, 217, 61, 0.4),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .wallet-btn.primary:hover {
          background: linear-gradient(135deg, #ffcd02 0%, #ffa500 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 20px rgba(255, 217, 61, 0.5),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .wallet-btn.secondary {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }

        .wallet-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Payout Schedule Card */
        .payout-schedule-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .payout-schedule-card::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -30%;
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, rgba(255, 217, 61, 0.05), rgba(255, 217, 61, 0.02));
          border-radius: 50%;
          transform: rotate(45deg);
        }

        .payout-schedule-card::after {
          content: "";
          position: absolute;
          bottom: -20%;
          left: -20%;
          width: 150px;
          height: 150px;
          background: repeating-conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(30, 39, 97, 0.03) 30deg,
            transparent 60deg
          );
          border-radius: 50%;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-left h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e2761;
        }

        .header-icon {
          color: #ffd93d;
        }

        .payout-badge {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .schedule-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .schedule-date, .schedule-amount {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 16px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .schedule-date:hover, .schedule-amount:hover {
          border-color: #ffd93d;
          background: #fffbf0;
        }

        .date-label, .amount-label {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .date-value, .amount-value {
          display: block;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e2761;
        }

        /* Activity Section */
        .activity-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }

        .activity-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          // background: linear-gradient(90deg, #4ade80, #22c55e, #ffd93d, #ffb800);
          background-size: 200% 100%;
          animation: gradientShift 3s ease-in-out infinite;
        }

        .activity-section::after {
          content: "";
          position: absolute;
          bottom: -30%;
          right: -15%;
          width: 120px;
          height: 120px;
          background: conic-gradient(
            from 180deg,
            rgba(255, 217, 61, 0.1) 0deg,
            rgba(34, 197, 94, 0.05) 120deg,
            rgba(255, 217, 61, 0.1) 240deg,
            transparent 360deg
          );
          border-radius: 50%;
          transform: rotate(45deg);
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
          z-index: 2;
        }

        .section-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e2761;
        }

        .activity-period {
          font-size: 0.85rem;
          color: #666;
          background: #f8f9fa;
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 500;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 2;
        }

        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 16px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .activity-item:hover {
          background: #f0f9ff;
          border-color: #e0f2fe;
          transform: translateY(-1px);
        }

        .activity-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .activity-icon-wrapper {
          padding: 8px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-icon.completed {
          color: #4ade80;
        }

        .status-icon.pending {
          color: #fbbf24;
        }

        .status-icon.failed {
          color: #ef4444;
        }

        .activity-details {
          flex: 1;
        }

        .activity-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .activity-method {
          font-weight: 600;
          color: #1e2761;
          font-size: 0.95rem;
        }

        .activity-time {
          font-size: 0.8rem;
          color: #666;
        }

        .activity-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .activity-date {
          font-size: 0.8rem;
          color: #666;
        }

        .reference-btn {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: #666;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .reference-btn:hover {
          background: #e5e7eb;
          color: #1e2761;
        }

        .activity-right {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .activity-amount {
          font-weight: 700;
          color: #4ade80;
          font-size: 1rem;
        }

        .activity-amount.failed {
          color: #ef4444;
        }

        .activity-status {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        /* Enhanced Menu Section */
        .menu-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .menu-item {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .menu-item:hover {
          background: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: #ffd93d;
        }

        .menu-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-icon {
          color: #ffd93d;
        }

        .menu-text {
          font-weight: 600;
          color: #1e2761;
          font-size: 1rem;
        }

        .menu-text-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .connected-card {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .menu-arrow {
          color: #999;
          transition: transform 0.3s ease;
        }

        .menu-item:hover .menu-arrow {
          transform: translateX(4px);
        }

        /* Mastercard Logo */
        .card-icon-container {
          width: 40px;
          height: 40px;
          background: #f8f9fa;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
        }

        .mastercard-logo {
          position: relative;
          width: 24px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-circle {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: absolute;
        }

        .card-circle.red {
          background: #eb001b;
          left: 0;
        }

        .card-circle.yellow {
          background: #f79e1b;
          right: 0;
          mix-blend-mode: multiply;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .wallet-container {
            padding: 16px;
          }

          .wallet-3d {
            max-width: 100%;
            height: 260px;
          }

          .wallet-front {
            padding: 28px 20px;
          }

          .balance-amount {
            font-size: 2.4rem;
          }

          .schedule-content {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .wallet-actions {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .activity-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .activity-right {
            align-self: flex-end;
            text-align: right;
          }
        }

        @media (max-width: 480px) {
          .balance-amount {
            font-size: 2rem;
            letter-spacing: -1px;
          }

          .activity-main {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .activity-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .wallet-3d {
            height: 240px;
            transform: rotateX(3deg) rotateY(-3deg);
          }

          .wallet-front {
            padding: 24px 18px;
          }

          .stitching-top, .stitching-bottom {
            left: 12px;
            right: 12px;
          }

          .stitching-left, .stitching-right {
            top: 12px;
            bottom: 12px;
          }

          .stitching-top {
            top: 10px;
          }

          .stitching-bottom {
            bottom: 10px;
          }

          .stitching-left {
            left: 10px;
          }

          .stitching-right {
            right: 10px;
          }
        }

        /* Enhanced scrollbar */
        .wallet-scroll-container::-webkit-scrollbar {
          width: 6px;
        }

        .wallet-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .wallet-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #cbd5e1, #94a3b8);
          border-radius: 6px;
        }

        .wallet-scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #94a3b8, #64748b);
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .wallet-3d,
          .wallet-btn::before,
          .activity-item,
          .menu-item {
            animation: none;
            transition: none;
          }

          .activity-section::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default WalletPage;
import React, { useState } from "react";
import BottomDock from "../../components/BottomDock";
import {
  Users,
  Gift,
  Share,
  Copy,
  Check,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";

function Referrals({ onLogout = () => {} }) {
  const [activeTab, setActiveTab] = useState("referrals");
  const [isOnline, setIsOnline] = useState(false);
  const [currentTab, setCurrentTab] = useState("offers"); // offers or status
  const [copied, setCopied] = useState(false);

  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("VAYE2024ABC");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-layout">
      {/* Animated GIF Section */}
      <div className="gif-section">
        {/* <div className="invite-friends-label">Invite Friends</div> */}
        <div className="animated-gif-container">
          {/* Replace this placeholder with your GIF */}
          <img
            src="/images/Invite.png"
            alt="Invite Friends Animation"
            className="invite-gif"
          />
          {/* Optionally keep the animation rings for effect */}
          {/* <div className="animation-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div> */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${currentTab === "offers" ? "active" : ""}`}
          onClick={() => setCurrentTab("offers")}
        >
          Offers
        </button>
        <button
          className={`tab-button ${currentTab === "status" ? "active" : ""}`}
          onClick={() => setCurrentTab("status")}
        >
          Status
        </button>
      </div>

      {/* Content Area */}
      <div className="content-container">
        {currentTab === "offers" ? (
          <div className="offers-content">
            <div className="offers-header">
              <h2>Invite a friend to join Vaye</h2>
              <p className="offers-subtitle">
                Invite someone you know to join Vaye and make money on their own
                schedule
              </p>
              <p className="terms-apply">Terms apply</p>
            </div>

            {/* Referral Card */}
            <div className="referral-card">
              <div className="referral-reward">
                <div className="reward-icon">
                  <Gift size={32} />
                </div>
                <div className="reward-info">
                  <h3>Earn R100</h3>
                  <p>For each friend who completes 10 trips</p>
                </div>
              </div>

              <div className="referral-code-section">
                <label>Your referral code</label>
                <div className="code-container">
                  <span className="referral-code">VAYE2024ABC</span>
                  <button className="copy-button" onClick={handleCopyCode}>
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <button className="share-button">
                <Share size={20} />
                Share with friends
              </button>
            </div>

            {/* How it Works */}
            <div className="how-it-works">
              <h3>How it works</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Share your code</h4>
                    <p>Send your referral code to friends and family</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>They sign up</h4>
                    <p>Your friend downloads the app and enters your code</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Start earning</h4>
                    <p>You both earn rewards when they complete trips</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="status-content">
            <div className="status-header">
              <h2>Referral Status</h2>
              <p>Track your referral progress and earnings</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>5</h3>
                  <p>Friends invited</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h3>3</h3>
                  <p>Active referrals</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>R300</h3>
                  <p>Total earned</p>
                </div>
              </div>
            </div>

            {/* Referral List */}
            <div className="referral-list">
              <h3>Your Referrals</h3>
              <div className="referral-items">
                <div className="referral-item">
                  <div className="referral-avatar">
                    <span>JD</span>
                  </div>
                  <div className="referral-details">
                    <h4>John Doe</h4>
                    <p>Completed 15 trips</p>
                  </div>
                  <div className="referral-status completed">
                    <Check size={16} />
                    <span>R100 earned</span>
                  </div>
                </div>

                <div className="referral-item">
                  <div className="referral-avatar">
                    <span>SM</span>
                  </div>
                  <div className="referral-details">
                    <h4>Sarah Miller</h4>
                    <p>7 of 10 trips completed</p>
                  </div>
                  <div className="referral-status pending">
                    <Clock size={16} />
                    <span>3 trips to go</span>
                  </div>
                </div>

                <div className="referral-item">
                  <div className="referral-avatar">
                    <span>MJ</span>
                  </div>
                  <div className="referral-details">
                    <h4>Mike Johnson</h4>
                    <p>Completed 12 trips</p>
                  </div>
                  <div className="referral-status completed">
                    <Check size={16} />
                    <span>R100 earned</span>
                  </div>
                </div>

                <div className="referral-item">
                  <div className="referral-avatar">
                    <span>LW</span>
                  </div>
                  <div className="referral-details">
                    <h4>Lisa Williams</h4>
                    <p>Just signed up</p>
                  </div>
                  <div className="referral-status new">
                    <Star size={16} />
                    <span>New driver</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
      />

      <style jsx>{`
        .app-layout {
          height: 100vh;
          background: #2a3990;
          overflow: hidden;
        }

        /* Animated GIF Section */
        .gif-section {
          position: relative;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .invite-friends-label {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #000000;
          font-size: 1.2rem;
          font-weight: 700;
          z-index: 20;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .animated-gif-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invite-gif {
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 5;
        }

        .gif-placeholder {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 5;
        }

        .animation-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .ring-1 {
          width: 120px;
          height: 120px;
          margin: -60px 0 0 -60px;
          animation-delay: 0s;
        }

        .ring-2 {
          width: 160px;
          height: 160px;
          margin: -80px 0 0 -80px;
          animation-delay: 0.5s;
        }

        .ring-3 {
          width: 200px;
          height: 200px;
          margin: -100px 0 0 -100px;
          animation-delay: 1s;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          margin: 0 20px;
          border-radius: 12px;
          padding: 4px;
        }

        .tab-button {
          flex: 1;
          padding: 12px 24px;
          background: transparent;
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          background: white;
          color: #2a3990;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .tab-button:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Content Container */
        .content-container {
          flex: 1;
          background: #f8f9fa;
          margin: 20px 20px 0 20px;
          border-radius: 20px 20px 0 0;
          overflow-y: auto;
          padding: 30px 20px 100px 20px;
        }

        /* Offers Content */
        .offers-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .offers-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e2761;
          margin: 0 0 12px 0;
        }

        .offers-subtitle {
          font-size: 1rem;
          color: #64748b;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .terms-apply {
          font-size: 0.9rem;
          color: #64748b;
          text-decoration: underline;
          margin: 0;
        }

        .referral-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .referral-reward {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .reward-icon {
          padding: 12px;
          background: linear-gradient(135deg, #ffd93d, #ffb800);
          border-radius: 12px;
          color: white;
        }

        .reward-info h3 {
          margin: 0 0 4px 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e2761;
        }

        .reward-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .referral-code-section {
          margin-bottom: 24px;
        }

        .referral-code-section label {
          display: block;
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .code-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .referral-code {
          flex: 1;
          font-family: "Courier New", monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e2761;
          letter-spacing: 1px;
        }

        .copy-button {
          padding: 8px;
          background: #2a3990;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .copy-button:hover {
          background: #1e2761;
          transform: scale(1.05);
        }

        .share-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: #2a3990;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .share-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(42, 57, 144, 0.3);
        }

        /* How it Works */
        .how-it-works {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .how-it-works h3 {
          margin: 0 0 24px 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e2761;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ffd93d, #ffb800);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e2761;
        }

        .step-content p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        /* Status Content */
        .status-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .status-header h2 {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e2761;
          margin: 0 0 8px 0;
        }

        .status-header p {
          color: #64748b;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px 16px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          margin: 0 auto 12px auto;
          padding: 8px;
          background: #2a3990;
          color: white;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info h3 {
          margin: 0 0 4px 0;
          font-size: 1.6rem;
          font-weight: 700;
          color: #1e2761;
        }

        .stat-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .referral-list {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .referral-list h3 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e2761;
        }

        .referral-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .referral-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .referral-avatar {
          width: 48px;
          height: 48px;
          background: #2a3990;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .referral-details {
          flex: 1;
        }

        .referral-details h4 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1e2761;
        }

        .referral-details p {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .referral-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .referral-status.completed {
          background: #dcfce7;
          color: #166534;
        }

        .referral-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .referral-status.new {
          background: #e0e7ff;
          color: #3730a3;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .content-container {
            margin: 20px 10px 0 10px;
            padding: 20px 15px 100px 15px;
          }

          .tab-navigation {
            margin: 0 10px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .offers-header h2 {
            font-size: 1.5rem;
          }

          .step {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}

export default Referrals;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Link,
  CreditCard,
  Zap,
  Mail,
  RefreshCw,
  X,
} from "lucide-react";
import "./Tribaal-info.css";
import zb from "../../assets/images/images/zblogo2.png";
import TribaalLinkingService from "../../services/TribaalLinkingService";
import { useAuth } from "../../context/AuthContext";

const TribaalInfo = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [linkStatus, setLinkStatus] = useState(null);
  const [balanceResult, setBalanceResult] = useState(null);
  const { user } = useAuth();
  console.log("TribaalInfo user:", user.token); // <-- Add this line
  const [walletData, setWalletData] = useState(null);

  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  // Load initial data
  useEffect(() => {
    loadAccountStatus();
  }, []);

  const loadAccountStatus = async () => {
    try {
      const status = await TribaalLinkingService.getLinkStatus(user.token); // Pass token here
      setLinkStatus(status.data);
      setIsConnected(
        status.data.isLinked && status.data.linkStatus === "active"
      );
      if (status.data.isLinked && status.data.linkStatus === "active") {
        setWalletData(status.data.wallet);
      }
    } catch (error) {
      console.error("Failed to load account status:", error);
    }
  };

  useEffect(() => {
    // Only fetch balance if walletData and mobile exist
    if (walletData && walletData.mobile) {
      const fetchBalance = async () => {
        try {
          const balanceRes = await TribaalLinkingService.getWalletBalance(
            user.token,
            walletData.mobile
          );
          setBalanceResult(balanceRes);
        } catch (error) {
          setBalanceResult(null);
        }
      };
      fetchBalance();
    }
  }, [walletData, user.token]);

  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const handleConnect = () => {
    setShowLoginModal(true);
  };

  // const handleBalanceEnquiry = async () => {
  //   try {
  //     const result = await TribaalLinkingService.getWalletBalance(
  //       user.token,
  //       walletData.mobile
  //     );
  //     if (result.success) {
  //       showNotification(
  //         "success",
  //         "Balance Enquiry Successful",
  //         `Your current balance is ${result.data.balance}`
  //       );
  //     }
  //   } catch (error) {
  //     showNotification("error", "Balance Enquiry Failed", error.message);
  //   }
  // };

  const handleLogin = async (e) => {
    const result = await TribaalLinkingService.linkTribaalAccount(
      loginCredentials.email,
      loginCredentials.password,
      user.token
    );
    e.preventDefault();
    if (!loginCredentials.email || !loginCredentials.password) {
      showNotification(
        "error",
        "Missing Information",
        "Please enter both email and password"
      );
      return;
    }

    setIsConnecting(true);
    setShowLoginModal(false);

    try {
      // Show OTP notification first
      showNotification(
        "info",
        "Authenticating",
        "Verifying your Tribaal account credentials..."
      );

      // Attempt to link the account
      const result = await TribaalLinkingService.linkTribaalAccount(
        loginCredentials.email,
        loginCredentials.password
      );

      setIsConnecting(false);

      if (result.success) {
        setIsConnected(true);
        setWalletData(result.data.wallet);
        showNotification(
          "success",
          "Account Connected",
          "Your Tribaal account has been successfully linked to Vaye!"
        );

        // Reload account status
        await loadAccountStatus();
      }
    } catch (error) {
      setIsConnecting(false);
      showNotification("error", "Connection Failed", error.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await TribaalLinkingService.disconnectAccount(user.token);
      setIsConnected(false);
      setWalletData(null);
      setLinkStatus(null);
      showNotification(
        "success",
        "Account disconnected successfully",
        "Your Tribaal account has been disconnected from Vaye"
      );
    } catch (error) {
      showNotification("error", "Disconnect Failed", error.message);
    }
  };

  const handleSyncWallet = async () => {
    setIsSyncing(true);
    try {
      const result = await TribaalLinkingService.syncWallet(user.token);

      if (result.success && result.data.wallet) {
        setWalletData(result.data.wallet);

        // Use the mobile from the sync response for balance enquiry
        const balanceRes = await TribaalLinkingService.getWalletBalance(
          user.token,
          result.data.wallet.mobile
        );
        setBalanceResult(balanceRes); // Save the balance response

        showNotification(
          "success",
          "Wallet Synced",
          "Your wallet data has been updated"
        );
      } else {
        showNotification(
          "error",
          "Sync Failed",
          "Wallet mobile number not found."
        );
      }
    } catch (error) {
      showNotification("error", "Sync Failed", error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setLoginCredentials({ email: "", password: "" });
  };

  const benefits = [
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Pay for rides instantly using your Tribaal balance",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Bank-level security for all your payment transactions",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "See your balance and transactions instantly",
    },
  ];

  return (
    <div className="Tri-container">
      {/* Header */}
      <div className="Tri-header">
        <button
          className="Tri-back-btn"
          onClick={() =>
            navigate("/trips", {
              state: {
                walletData,
                balanceResult,
              },
            })
          }
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="Tri-page-title">Connect Tribaal</h1>
      </div>

      {/* Hero Section */}
      <div className="Tri-hero-section">
        <div className="Tri-tribaal-logo">
          <div className="Tri-logo-circle">
            <Link size={32} color="#fbbf24" />
          </div>
        </div>
        <h2 className="Tri-hero-title">Link Your Tribaal Account</h2>
        <p className="Tri-hero-subtitle">
          Connect your Tribaal digital wallet to Vaye for seamless, instant
          payments
        </p>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="Tri-connection-status">
          <div className="Tri-status-card">
            <AlertCircle className="Tri-status-icon Tri-pending" size={24} />
            <div className="Tri-status-content">
              <h3>Account Not Connected</h3>
              <p>
                Connect your Tribaal account to start enjoying instant payments
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="Tri-connection-status">
          <div className="Tri-status-card Tri-connected">
            <CheckCircle className="Tri-status-icon Tri-success" size={24} />
            <div className="Tri-status-content">
              <h3>Successfully Connected!</h3>
              <p>Your Tribaal account is now linked to Vaye</p>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="Tri-benefits-section">
        <h3 className="Tri-section-title">Why Connect Tribaal?</h3>
        <div className="Tri-benefits-grid">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="Tri-benefit-card">
                <div className="Tri-benefit-icon">
                  <IconComponent size={24} />
                </div>
                <div className="Tri-benefit-content">
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Information */}
      <div className="Tri-account-info">
        <h3 className="Tri-section-title">Account Details</h3>
        <div className="Tri-info-card">
          <div className="Tri-info-row">
            <span className="Tri-info-label">Tribaal Balance</span>
            <span className="Tri-info-value">
              {balanceResult && balanceResult.balance !== undefined
                ? TribaalLinkingService.formatCurrency(
                    balanceResult.balance,
                    balanceResult.currency
                  )
                : "ZWG 0.00"}
            </span>
          </div>
          <div className="Tri-info-row">
            <span className="Tri-info-label">Account Status</span>
            <span
              className={`Tri-info-value ${
                isConnected ? "Tri-connected" : "Tri-pending"
              }`}
            >
              {isConnected ? "Connected" : "Not Connected"}
            </span>
          </div>
          {/* <div className="info-row">
            <span className="info-label">Last Sync</span>
            <span className="info-value">
              {linkStatus?.lastSync
                ? new Date(linkStatus.lastSync).toLocaleString()
                : "Never"}
            </span>
          </div> */}
        </div>
      </div>

      {/* Connection Process */}
      <div className="Tri-connection-process">
        <h3 className="Tri-section-title">How It Works</h3>
        <div className="Tri-process-steps">
          <div className="Tri-step">
            <div className="Tri-step-number">1</div>
            <div className="Tri-step-content">
              <h4>Secure Authentication</h4>
              <p>Log in to your Tribaal account using your credentials</p>
            </div>
          </div>
          <div className="Tri-step">
            <div className="Tri-step-number">2</div>
            <div className="Tri-step-content">
              <h4>Grant Permission</h4>
              <p>Authorize Vaye to access your Tribaal wallet for payments</p>
            </div>
          </div>
          <div className="Tri-step">
            <div className="Tri-step-number">3</div>
            <div className="Tri-step-content">
              <h4>Start Paying</h4>
              <p>Use your Tribaal balance for instant ride payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="Tri-action-section">
        {!isConnected ? (
          <button
            className={`Tri-connect-btn ${
              isConnecting ? "Tri-connecting" : ""
            }`}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <div className="Tri-spinner"></div>
                Connecting...
              </>
            ) : (
              <>
                <Link size={20} />
                Connect Tribaal Account
              </>
            )}
          </button>
        ) : (
          <div className="Tri-connected-actions">
            <button className="Tri-manage-btn" onClick={handleSyncWallet}>
              {isSyncing ? "Syncing..." : "Sync Wallet"}
            </button>
            <button className="Tri-disconnect-btn" onClick={handleDisconnect}>
              Disconnect Account
            </button>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="Tri-security-notice">
        <div className="Tri-notice-content">
          <Shield className="Tri-notice-icon" size={20} />
          <div className="Tri-notice-text">
            <h4>Your Security Matters</h4>
            <p>
              Your Tribaal account details are encrypted and never stored on our
              servers. We use bank-level security to protect your information.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "10px" }} className="Tri-security-notice">
        <div className="Tri-notice-content">
          <img
            style={{ width: "30px", height: "auto" }}
            src={zb}
            alt="Zb Financial Holdings"
            className="Tri-zb-logo"
          />
          <div className="Tri-notice-text">
            <h4>Powered by Zb Financial Holdings</h4>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="Tri-modal-overlay">
          <div className="Tri-modal">
            <div className="Tri-modal-header">
              <h3>Connect to Tribaal</h3>
              <button onClick={handleCloseModal} className="Tri-modal-close">
                ×
              </button>
            </div>
            <form onSubmit={handleLogin} className="Tri-modal-body">
              <p className="Tri-modal-subtitle">
                Enter your Tribaal credentials to securely link your account
              </p>

              <div className="Tri-form-group">
                <label htmlFor="tribaal-email">Tribaal Email</label>
                <input
                  type="email"
                  id="tribaal-email"
                  value={loginCredentials.email}
                  onChange={(e) =>
                    setLoginCredentials({
                      ...loginCredentials,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your Tribaal email"
                  required
                />
              </div>

              <div className="Tri-form-group">
                <label htmlFor="tribaal-password">Tribaal Password</label>
                <input
                  type="password"
                  id="tribaal-password"
                  value={loginCredentials.password}
                  onChange={(e) =>
                    setLoginCredentials({
                      ...loginCredentials,
                      password: e.target.value,
                    })
                  }
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="Tri-security-info">
                <Shield size={16} />
                <span>
                  Your credentials are secured with end-to-end encryption
                </span>
              </div>

              <div className="Tri-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="Tri-cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="Tri-login-btn">
                  Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div
          className={`Tri-notification Tri-notification-${notification.type}`}
        >
          <div className="Tri-notification-content">
            <div className="Tri-notification-icon">
              {notification.type === "success" && <CheckCircle size={20} />}
              {notification.type === "error" && <AlertCircle size={20} />}
              {notification.type === "info" && <Mail size={20} />}
            </div>
            <div className="Tri-notification-text">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
            </div>
            <button
              onClick={hideNotification}
              className="Tri-notification-close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TribaalInfo;

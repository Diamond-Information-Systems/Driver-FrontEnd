import React, { useState, useEffect } from "react";
import vayeLogo from "../../assets/images/VayeLogoB.png"; // Adjust the path as necessary
import { Bell, Menu } from "lucide-react";
import Header from "../../components/Header/Header"; 
import BottomDock from "../../components/BottomDock";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Download,
  Eye,
  EyeOff,
  ArrowUpRight,
  Wallet,
} from "lucide-react";

function Earnings({ onLogout = () => {} }) {
  const handleTabChange = (tabId) => {
    if (tabId === "logout") {
      onLogout();
      return;
    }
    setActiveTab(tabId);
  };

  const [activeTab, setActiveTab] = React.useState("earnings");
  const [isOnline, setIsOnline] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Sample data - Total earnings since starting
  const totalEarningsAllTime = 45780.25; // Total since started driving
  const cashEarnings = 15240.75;
  const cardEarnings = 30539.5;

  // Current month data for PDF export
  const currentMonthEarnings = 2640.75;
 const handleMenuClick = () => {
    console.log('Menu clicked!');
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked!');
  };

  const monthlyData = [
    { month: "Jan", amount: 1250 },
    { month: "Feb", amount: 1680 },
    { month: "Mar", amount: 2100 },
    { month: "Apr", amount: 1890 },
    { month: "May", amount: 2640 },
    { month: "Jun", amount: 0 }, // Future month
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentDate = new Date();
  const canGoNext =
    currentMonth.getMonth() < currentDate.getMonth() ||
    currentMonth.getFullYear() < currentDate.getFullYear();

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    if (canGoNext) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      );
    }
  };

  const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

  // PDF Export function
  const exportStatement = () => {
    const monthName = monthNames[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();
    const monthlyAmount = monthlyData[currentMonth.getMonth()]?.amount || 0;

    // Create PDF content
    const pdfContent = `
      VAYE DRIVER EARNINGS STATEMENT
      ${monthName} ${year}
      
      Driver: John Doe
      Vehicle: ABC123GP
      
      EARNINGS SUMMARY
      Total Earnings: R${monthlyAmount.toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}
      Cash Payments: R${(monthlyAmount * 0.3).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}
      Card Payments: R${(monthlyAmount * 0.7).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}
      
      Total Trips: 47
      Average Trip Value: R${(monthlyAmount / 47).toLocaleString("en-ZA", {
        minimumFractionDigits: 2,
      })}
      
      Generated on: ${new Date().toLocaleDateString("en-ZA")}
    `;

    // Simple PDF download simulation
    const element = document.createElement("a");
    const file = new Blob([pdfContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Vaye_Statement_${monthName}_${year}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCashOut = () => {
    // Handle cash out functionality
    alert("Cash out functionality would be implemented here");
  };

  return (
    <div className="app-layout" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Everything scrolls except the dock */}
      <div
        style={{
          height: "100vh",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "64px",
        }}
      >
        {/* Header */}
         <Header 
        notificationCount={5}
        onMenuClick={handleMenuClick}
        onNotificationClick={handleNotificationClick}
      />
        {/* Earnings Content */}
        <div className="earnings-container" style={{ minHeight: "unset" }}>
          {/* Total Earnings Card */}
          <div className="total-earnings-card">
            {/* Background Pattern */}
            <div className="card-pattern"></div>

            <div className="earnings-content">
              <div className="balance-section">
                <div className="balance-header">
                  <h2>Total Earnings</h2>
                  <button
                    className="visibility-toggle"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                  >
                    {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <div className="total-balance">
                  {balanceVisible
                    ? `R${totalEarningsAllTime.toLocaleString("en-ZA", {
                        minimumFractionDigits: 2,
                      })}`
                    : "R••••••"}
                </div>
                <div className="balance-subtitle">
                  Since you started driving
                </div>

                <div className="balance-breakdown">
                  <div className="breakdown-item">
                    <Banknote size={16} />
                    <span>
                      Cash:{" "}
                      {balanceVisible
                        ? `R${cashEarnings.toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                          })}`
                        : "R••••"}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <CreditCard size={16} />
                    <span>
                      Card:{" "}
                      {balanceVisible
                        ? `R${cardEarnings.toLocaleString("en-ZA", {
                            minimumFractionDigits: 2,
                          })}`
                        : "R••••"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Out Button */}
              <button className="cash-out-button" onClick={handleCashOut}>
                <Wallet size={20} />
                <span>Cash Out</span>
                <ArrowUpRight size={16} className="cash-out-icon" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats-card">
            <div className="stat-item">
              <div className="stat-value">47</div>
              <div className="stat-label">Trips Today</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">8.2h</div>
              <div className="stat-label">Online Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4.8★</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="chart-section">
            <div className="chart-header">
              <h3>Monthly Breakdown</h3>
              <div className="month-navigator">
                <button className="nav-button prev" onClick={goToPreviousMonth}>
                  <ChevronLeft size={20} />
                </button>
                <span className="current-month">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </span>
                <button
                  className={`nav-button next ${!canGoNext ? "disabled" : ""}`}
                  onClick={goToNextMonth}
                  disabled={!canGoNext}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="chart-container small">
              {monthlyData.map((data, index) => {
                const height =
                  data.amount > 0 ? (data.amount / maxAmount) * 100 : 0;
                const isCurrentMonth = index === currentMonth.getMonth();
                const isFutureMonth = index > currentDate.getMonth();

                return (
                  <div key={data.month} className="chart-bar-container">
                    <div className="chart-bar-wrapper">
                      <div
                        className={`chart-bar ${
                          isCurrentMonth ? "current" : ""
                        } ${isFutureMonth ? "future" : ""}`}
                        style={{ height: `${height}%` }}
                      >
                        {data.amount > 0 && !isFutureMonth && (
                          <div className="bar-value">
                            R{(data.amount / 1000).toFixed(1)}k
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chart-label">{data.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="actions-bar">
            <button className="action-button primary" onClick={exportStatement}>
              <Download size={18} />
              Export Statement
            </button>
          </div>
        </div>
      </div>

      {/* Absolutely fixed bottom dock */}
      <div className="bottom-dock-fixed">
        <BottomDock
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOnline={isOnline}
        />
      </div>

      <style jsx>{`
        .bottom-dock-fixed {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          background: transparent;
        }
        .earnings-container {
          padding: 1rem;
          background: #f8f9fa;
          padding-bottom: 16px;
        }
        .app-header {
          position: static !important;
        }

        /* Total Earnings Card - New Design */
        .total-earnings-card {
          background: linear-gradient(
            135deg,
            rgb(15, 23, 42) 0%,
            rgb(28, 31, 135) 50%,
            rgb(15, 23, 42) 100%
          );
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .card-pattern {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          border-radius: 50%;
          transform: translate(50%, -50%);
        }

        .card-pattern::before {
          content: "";
          position: absolute;
          top: 60px;
          right: 60px;
          width: 100px;
          height: 100px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 70%
          );
          border-radius: 50%;
        }

        .earnings-content {
          position: relative;
          z-index: 2;
        }

        .balance-section {
          margin-bottom: 24px;
        }

        .balance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .balance-header h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .visibility-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 12px;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .visibility-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .total-balance {
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 4px;
          background: linear-gradient(45deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .balance-subtitle {
          font-size: 0.85rem;
          opacity: 0.7;
          margin-bottom: 20px;
          font-weight: 400;
        }

        .balance-breakdown {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 12px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .cash-out-button {
          width: 100%;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 16px 24px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .cash-out-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s;
        }

        .cash-out-button:hover::before {
          left: 100%;
        }

        .cash-out-button:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .cash-out-icon {
          transition: transform 0.3s ease;
        }

        .cash-out-button:hover .cash-out-icon {
          transform: translate(2px, -2px);
        }

        /* Quick Stats Card */
        .quick-stats-card {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-item {
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 20px 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: #ffd93d;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1e2761;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        /* Chart Section */
        .chart-section {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .month-navigator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .nav-button {
          background: #f8f9fa;
          border: none;
          border-radius: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
        }

        .nav-button.prev {
          margin-right: 0.25rem;
        }
        .nav-button.next {
          margin-left: 0.25rem;
        }

        .nav-button:hover:not(.disabled) {
          background: #ffd93d;
          color: white;
        }

        .nav-button.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .current-month {
          font-weight: 600;
          color: #1e2761;
          min-width: 110px;
          text-align: center;
          flex-shrink: 0;
        }

        .chart-container.small {
          max-width: 320px;
          margin: 0 auto;
        }

        .chart-container {
          display: flex;
          align-items: end;
          justify-content: space-between;
          height: 150px;
          gap: 0.5rem;
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .chart-bar-wrapper {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
          margin-bottom: 0.5rem;
        }

        .chart-bar {
          width: 24px;
          background: linear-gradient(to top, #2a3990, #4facfe);
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
          min-height: 4px;
        }

        .chart-bar.current {
          background: linear-gradient(to top, #ffb800, #ffd93d);
        }

        .chart-bar.future {
          background: #e9ecef;
        }

        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          font-weight: 600;
          color: #1e2761;
          white-space: nowrap;
        }

        .chart-label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        /* Actions Bar */
        .actions-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 1rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-button.primary {
          background: #ffd93d;
          color: #1e2761;
        }

        .action-button.primary:hover {
          background: #ffb800;
          transform: translateY(-2px);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .earnings-container {
            padding: 0.5rem;
          }

          .total-balance {
            font-size: 2.2rem;
          }

          .balance-breakdown {
            flex-direction: column;
            gap: 12px;
          }

          .breakdown-item {
            justify-content: center;
          }

          .quick-stats-card {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 16px;
          }

          .stat-item {
            padding: 16px 8px;
          }

          .stat-value {
            font-size: 1.2rem;
          }

          .total-earnings-card {
            padding: 20px;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Earnings;

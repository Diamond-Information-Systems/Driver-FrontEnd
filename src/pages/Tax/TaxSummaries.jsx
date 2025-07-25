import React, { useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoDownload,
  IoStatsChart,
  IoCalendar,
  IoWallet,
  IoCarSport,
} from "react-icons/io5";
import "./TaxManagement.css";

const TaxSummaries = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("annual");
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const summaryData = {
    annual: [
      {
        id: "2024",
        title: "2024 Annual tax summary",
        year: "2024",
      },
      {
        id: "2023",
        title: "2023 Annual tax summary",
        year: "2023",
      },
    ],
    monthly: [
      {
        id: "may-2025",
        title: "May 2025",
        period: "01-31 May 2025",
      },
      {
        id: "april-2025",
        title: "April 2025",
        period: "01-30 April 2025",
      },
      {
        id: "march-2025",
        title: "March 2025",
        period: "01-31 March 2025",
      },
      {
        id: "february-2025",
        title: "February 2025",
        period: "01-28 February 2025",
      },
      {
        id: "january-2025",
        title: "January 2025",
        period: "01-31 January 2025",
      },
    ],
  };

  const generateSummaryPDF = (summary) => {
    const pdfContent = `
      <div class="vaye-summary-document">
        <div class="vaye-summary-header">
          <div class="vaye-logo-space">Vaye Logo Here</div>
          <div class="vaye-pdf-company-info">
            <h2>Vaye B.V.</h2>
            <p>Burgemeestershuis 301, 1076 HR Amsterdam</p>
            <p>Amsterdam, Netherlands</p>
            <p>VAT: NL852071589B01</p>
          </div>
        </div>

        <div class="vaye-summary-header" style="text-align: center; border: none; padding-bottom: 0;">
          <div class="vaye-summary-period">${
            summary.period || summary.year
          }</div>
          <h1 class="vaye-summary-title">Tax summary</h1>
          <p class="vaye-summary-subtitle">Thanks for driving with Vaye, Nhlamulo!</p>
          <p class="vaye-summary-note">
            This tax summary is a document showing your trip revenue, 
            expenses and net payout. We note that this tax summary 
            reflects the relevant amounts in a calendar month and 
            therefore does not necessarily match with the amounts stated 
            in your last 4 weekly statements.
          </p>
          <div style="display: flex; justify-content: center; margin: 20px 0;">
            <div style="
              width: 120px; 
              height: 120px; 
              border-radius: 50%; 
              background: linear-gradient(135deg, #1e2761 0%, #2d3f8f 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 48px;
            ">
              🚗
            </div>
          </div>
        </div>

        <div class="vaye-summary-grid">
          <div class="vaye-summary-section">
            <h3>Revenue</h3>
            <table class="vaye-summary-table">
              <tr>
                <td>Trip revenue *</td>
                <td>R 3 701,84</td>
              </tr>
              <tr>
                <td>Revenue from other services</td>
                <td>R 362,89</td>
              </tr>
              <tr style="font-weight: 700; border-top: 2px solid #1e2761;">
                <td><strong>Total revenue</strong></td>
                <td><strong>R 4 064,73</strong></td>
              </tr>
            </table>
          </div>

          <div class="vaye-summary-section">
            <h3>Expenses</h3>
            <table class="vaye-summary-table">
              <tr>
                <td>Vaye Service Fee</td>
                <td>R 1 130,47</td>
              </tr>
              <tr>
                <td>Other charges</td>
                <td>R 133,80</td>
              </tr>
              <tr style="font-weight: 700; border-top: 2px solid #1e2761;">
                <td><strong>Total expenses</strong></td>
                <td><strong>(R 1 264,27)</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <div class="vaye-summary-total">
          <h3>Total payout</h3>
          <div class="amount">R 2 800,46</div>
        </div>

        <div style="margin-top: 40px; font-size: 12px; color: #64748b;">
          <p><strong>* Transportation services are VAT-exempt</strong></p>
          <br>
          <p><strong>Tax summary - ${
            summary.period || summary.year
          }</strong></p>
          <p>For more info on filing tax returns, you can visit the South African Revenue Service website <a href="https://www.sarsefiling.co.za/" style="color: #1e2761;">https://www.sarsefiling.co.za/</a></p>
          <p>If you have any questions about your tax summary you can reach out to our Support team via the Driver App.</p>
          <p style="text-align: right; margin-top: 20px;">Page 1 of 2</p>
        </div>

        <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
          <div class="vaye-pdf-company-info">
            <h2>Vaye B.V.</h2>
            <p>Burgemeestershuis 301, 1076 HR Amsterdam</p>
            <p>Amsterdam, Netherlands</p>
            <p>VAT: NL852071589B01</p>
          </div>
          <h3 style="color: #1e2761; margin: 20px 0;">Notes and disclaimers</h3>
          <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
            Additional terms and conditions may apply. Please refer to the Vaye driver agreement 
            for complete terms and conditions. This document is generated automatically and 
            serves as an official tax summary for your records.
          </p>
        </div>
      </div>
    `;

    // Create and trigger download
    const element = document.createElement("a");
    const file = new Blob(
      [
        `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Summary ${summary.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 20px;
              background: white;
              line-height: 1.6;
            }
            .vaye-summary-document {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
            }
            .vaye-summary-header {
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
            }
            .vaye-logo-space {
              width: 200px;
              height: 80px;
              border: 2px dashed #e2e8f0;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 20px;
            }
            .vaye-pdf-company-info h2 {
              font-size: 20px;
              font-weight: 700;
              color: #1e2761;
              margin-bottom: 8px;
            }
            .vaye-pdf-company-info p {
              font-size: 12px;
              color: #475569;
              margin-bottom: 4px;
            }
            .vaye-summary-period {
              font-size: 14px;
              color: #475569;
              margin-bottom: 8px;
            }
            .vaye-summary-title {
              font-size: 28px;
              font-weight: 800;
              color: #1e2761;
              margin-bottom: 16px;
            }
            .vaye-summary-subtitle {
              font-size: 18px;
              color: #475569;
              margin-bottom: 20px;
            }
            .vaye-summary-note {
              font-size: 12px;
              color: #64748b;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto 20px;
            }
            .vaye-summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 32px;
            }
            .vaye-summary-section {
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              border-left: 4px solid #ffd93d;
            }
            .vaye-summary-section h3 {
              font-size: 16px;
              font-weight: 700;
              color: #1e2761;
              margin-bottom: 16px;
            }
            .vaye-summary-table {
              width: 100%;
              border-collapse: collapse;
            }
            .vaye-summary-table td {
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 12px;
            }
            .vaye-summary-table td:first-child {
              color: #475569;
              width: 60%;
            }
            .vaye-summary-table td:last-child {
              color: #0f172a;
              font-weight: 600;
              text-align: right;
            }
            .vaye-summary-total {
              background: #1e2761;
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin-bottom: 40px;
            }
            .vaye-summary-total h3 {
              font-size: 16px;
              margin-bottom: 8px;
              opacity: 0.9;
            }
            .vaye-summary-total .amount {
              font-size: 32px;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          ${pdfContent}
        </body>
      </html>
    `,
      ],
      { type: "text/html" }
    );

    element.href = URL.createObjectURL(file);
    element.download = `Tax_Summary_${summary.title.replace(/\s+/g, "_")}.html`;
    element.click();
  };

  const handleSummaryClick = (summary) => {
    setSelectedPeriod(summary);
  };

  const handleDownload = (summary) => {
    generateSummaryPDF(summary);
  };

  const handleMonthClick = (month) => {
    // Navigate to monthly summary detail
    setSelectedPeriod({
      ...month,
      period: month.period || `${month.title} Monthly Summary`,
    });
  };

  const renderSummaryDetail = () => {
    if (!selectedPeriod) return null;

    return (
      <div className="vaye-tax-page">
        <header className="vaye-tax-header dark">
          <button
            className="vaye-tax-back-btn"
            onClick={() => setSelectedPeriod(null)}
          >
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-tax-title">{selectedPeriod.title}</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-tax-content">
          <div className="vaye-summary-document" id="summary-content">
            <div className="vaye-summary-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div className="vaye-logo-space">
                  <img
                    src="/images/VayeLogoB.png"
                    alt=" Vaye Logo "
                    style={{
                      width: "100%",
                      height: "260px",
                      objectFit: "fill",
                    }}
                  />
                </div>
                <div className="vaye-pdf-company-info">
                  <h2>Vaye B.V.</h2>
                  <p>Burgemeestershuis 301, 1076 HR Amsterdam</p>
                  <p>Amsterdam, Netherlands</p>
                  <p>VAT: NL852071589B01</p>
                  <p style={{ color: "#1e2761", marginTop: "12px" }}>
                    <strong>Nhlamulo Chauke</strong>
                    <br />
                    South Africa
                    <br />
                    <a href="#" style={{ color: "#1e2761", fontSize: "12px" }}>
                      Update tax information
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div
              className="vaye-summary-header"
              style={{ textAlign: "center", border: "none", paddingBottom: 0 }}
            >
              <div className="vaye-summary-period">
                {selectedPeriod.period || selectedPeriod.year}
              </div>
              <h1 className="vaye-summary-title">Tax summary</h1>
              <p className="vaye-summary-subtitle">
                Thanks for driving with Vaye, Nhlamulo!
              </p>
              <p className="vaye-summary-note">
                This tax summary is a document showing your trip revenue,
                expenses and net payout. We note that this tax summary reflects
                the relevant amounts in a calendar month and therefore does not
                necessarily match with the amounts stated in your last 4 weekly
                statements.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "30px 0",
                  fontSize: "80px",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #1e2761 0%, #2d3f8f 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffd93d",
                  }}
                >
                  <IoCarSport />
                </div>
              </div>
            </div>

            <div className="vaye-summary-grid">
              <div className="vaye-summary-section">
                <h3>Revenue</h3>
                <table className="vaye-summary-table">
                  <tbody>
                    <tr>
                      <td>Trip revenue *</td>
                      <td>R 3 701,84</td>
                    </tr>
                    <tr>
                      <td>Revenue from other services</td>
                      <td>R 362,89</td>
                    </tr>
                    <tr
                      style={{
                        fontWeight: 700,
                        borderTop: "2px solid #1e2761",
                      }}
                    >
                      <td>
                        <strong>Total revenue</strong>
                      </td>
                      <td>
                        <strong>R 4 064,73</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="vaye-summary-section">
                <h3>Expenses</h3>
                <table className="vaye-summary-table">
                  <tbody>
                    <tr>
                      <td>Vaye Service Fee</td>
                      <td>R 1 130,47</td>
                    </tr>
                    <tr>
                      <td>Other charges</td>
                      <td>R 133,80</td>
                    </tr>
                    <tr
                      style={{
                        fontWeight: 700,
                        borderTop: "2px solid #1e2761",
                      }}
                    >
                      <td>
                        <strong>Total expenses</strong>
                      </td>
                      <td>
                        <strong>(R 1 264,27)</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="vaye-summary-total">
              <h3>Total payout</h3>
              <div className="amount">R 2 800,46</div>
            </div>

            <div
              style={{
                marginTop: "40px",
                fontSize: "12px",
                color: "var(--vaye-text-muted)",
                lineHeight: "1.6",
              }}
            >
              <p>
                <strong>* Transportation services are VAT-exempt</strong>
              </p>
              <br />
              <p>
                <strong>
                  Tax summary - {selectedPeriod.period || selectedPeriod.year}
                </strong>
              </p>
              <p>
                For more info on filing tax returns, you can visit the South
                African Revenue Service website
                <a
                  href="https://www.sarsefiling.co.za/"
                  style={{ color: "var(--vaye-primary-navy)" }}
                >
                  {" "}
                  https://www.sarsefiling.co.za/
                </a>
              </p>
              <p>
                If you have any questions about your tax summary you can reach
                out to our Support team via the Driver App.
              </p>
              <p style={{ textAlign: "right", marginTop: "20px" }}>
                Page 1 of 2
              </p>
            </div>
          </div>

          <button
            className="vaye-tax-button"
            onClick={() => handleDownload(selectedPeriod)}
            style={{ marginTop: "24px" }}
          >
            <IoDownload size={20} />
            Download
          </button>
        </div>
      </div>
    );
  };

  const renderMonthlyList = () => {
    return (
      <div className="vaye-tax-page">
        <header className="vaye-tax-header dark">
          <button
            className="vaye-tax-back-btn"
            onClick={() => setActiveTab("annual")}
          >
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-tax-title">Monthly 2025</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-tax-content">
          <div className="vaye-invoice-list">
            {summaryData.monthly.map((month, index) => (
              <div
                key={index}
                className="vaye-tax-menu-item"
                onClick={() => handleMonthClick(month)}
              >
                <div className="vaye-tax-menu-content">
                  <h3>{month.title}</h3>
                </div>
                <IoChevronForward className="vaye-tax-chevron" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (selectedPeriod) {
    return renderSummaryDetail();
  }

  if (activeTab === "monthly" && !selectedPeriod) {
    return renderMonthlyList();
  }

  return (
    <div className="vaye-tax-page">
      <header className="vaye-tax-header dark">
        <button className="vaye-tax-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-tax-title">Tax summaries</h1>
        <div style={{ width: "48px" }}></div>
      </header>

      <div className="vaye-tax-content">
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "24px",
            background: "var(--vaye-gradient-card)",
            borderRadius: "20px",
            border: "1px solid var(--vaye-glass-border)",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              color: "var(--vaye-text-secondary)",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Here you can find statements of your earnings, expenses and net
            payouts from Vaye on a monthly or annual basis.
          </p>
          <button
            className="vaye-tax-button secondary"
            style={{ width: "auto", padding: "12px 24px" }}
          >
            Learn more
          </button>
        </div>

        <div className="vaye-tax-tabs">
          <button
            className={`vaye-tax-tab ${activeTab === "annual" ? "active" : ""}`}
            onClick={() => setActiveTab("annual")}
          >
            Annual
          </button>
          <button
            className={`vaye-tax-tab ${
              activeTab === "monthly" ? "active" : ""
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
        </div>

        <div className="vaye-invoice-list">
          {activeTab === "annual" ? (
            summaryData.annual.map((summary, index) => (
              <div
                key={index}
                className="vaye-tax-menu-item"
                onClick={() => handleSummaryClick(summary)}
              >
                <div className="vaye-tax-menu-content">
                  <h3>{summary.title}</h3>
                </div>
                <IoChevronForward className="vaye-tax-chevron" />
              </div>
            ))
          ) : (
            <div
              className="vaye-tax-menu-item"
              onClick={() => setActiveTab("monthly")}
            >
              <div className="vaye-tax-menu-content">
                <h3>2025</h3>
                <p>View monthly summaries</p>
              </div>
              <IoChevronForward className="vaye-tax-chevron" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxSummaries;

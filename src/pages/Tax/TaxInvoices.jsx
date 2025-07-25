import React, { useState } from "react";
import {
  IoChevronBack,
  IoDownload,
  IoDocument,
  IoReceipt,
} from "react-icons/io5";
import "./TaxManagement.css";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TaxInvoices = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("trip");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const invoiceData = {
    trip: [
      {
        id: "GGDHICII-03-2025-0000771",
        date: "10 May 2025",
        amount: "R 73,69",
      },
      {
        id: "GGDHICII-03-2025-0000770",
        date: "10 May 2025",
        amount: "R 43,10",
      },
      {
        id: "GGDHICII-03-2025-0000769",
        date: "10 May 2025",
        amount: "R 48,98",
      },
      {
        id: "GGDHICII-03-2025-0000768",
        date: "10 May 2025",
        amount: "R 10,00",
      },
      {
        id: "GGDHICII-03-2025-0000767",
        date: "10 May 2025",
        amount: "R 55,51",
      },
      {
        id: "GGDHICII-03-2025-0000766",
        date: "10 May 2025",
        amount: "R 37,80",
      },
      {
        id: "GGDHICII-03-2025-0000765",
        date: "10 May 2025",
        amount: "R 57,20",
      },
      {
        id: "GGDHICII-03-2025-0000764",
        date: "10 May 2025",
        amount: "R 93,65",
      },
      {
        id: "GGDHICII-03-2025-0000763",
        date: "9 May 2025",
        amount: "R 33,08",
      },
      {
        id: "GGDHICII-03-2025-0000762",
        date: "9 May 2025",
        amount: "R 28,45",
      },
    ],
    vaye: [
      {
        id: "VAYE-2025-INV-001",
        date: "15 May 2025",
        amount: "R 1,250,00",
      },
      {
        id: "VAYE-2025-INV-002",
        date: "30 April 2025",
        amount: "R 890,50",
      },
    ],
    toVaye: [
      {
        id: "TO-VAYE-2025-001",
        date: "10 May 2025",
        amount: "R 450,00",
      },
    ],
  };

  const generateInvoicePDF = async (invoice) => {
    try {
      const element = document.getElementById("invoice-content");

      // Generate canvas from the invoice element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`Invoice_${invoice.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to simple download if PDF generation fails
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownload = (invoice) => {
    generateInvoicePDF(invoice);
  };

  const renderInvoiceDetail = () => {
    if (!selectedInvoice) return null;

    return (
      <div className="vaye-tax-page">
        <header className="vaye-tax-header dark">
          <button
            className="vaye-tax-back-btn"
            onClick={() => setSelectedInvoice(null)}
          >
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-tax-title">Invoice</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-tax-content">
          <div className="vaye-mobile-invoice" id="invoice-content">
            {/* Mobile-Optimized Invoice Display */}
            <div className="vaye-mobile-invoice-header">
              <div className="vaye-mobile-logo-space">
                <img
                  src="/images/VayeLogoB.png"
                  alt=" Vaye Logo "
                  style={{ width: "100%", height: "260px", objectFit: "fill" }}
                />
              </div>
              <div className="vaye-mobile-company-info">
                <h2>Invoice issued by Vaye B.V. on behalf of:</h2>
                <p className="vaye-highlight-name">Nhlamulo Chauke</p>
                <p>South Africa</p>
              </div>
            </div>

            <h1 className="vaye-mobile-invoice-title">Invoice</h1>

            {/* Two Column Layout for Mobile */}
            <div className="vaye-mobile-invoice-details">
              <div className="vaye-mobile-detail-section">
                <h3>From:</h3>
                <p>Sylvester Lamola</p>
                <p>South Africa</p>
              </div>
              <div className="vaye-mobile-detail-section">
                <h3>Invoice Details:</h3>
                <p>
                  <strong>Invoice number:</strong>
                </p>
                <p className="vaye-invoice-number-mobile">
                  {selectedInvoice.id}
                </p>
                <p>
                  <strong>Invoice date:</strong> {selectedInvoice.date}
                </p>
              </div>
            </div>

            {/* Mobile-Friendly Table */}
            <div className="vaye-mobile-table-container">
              <div className="vaye-mobile-table-header">
                <span>Service Details</span>
              </div>
              <div className="vaye-mobile-table-row">
                <div className="vaye-mobile-table-cell">
                  <span className="vaye-mobile-label">Date:</span>
                  <span className="vaye-mobile-value">
                    {selectedInvoice.date}
                  </span>
                </div>
                <div className="vaye-mobile-table-cell">
                  <span className="vaye-mobile-label">Description:</span>
                  <span className="vaye-mobile-value">
                    Transportation service fare
                  </span>
                </div>
                <div className="vaye-mobile-table-cell">
                  <span className="vaye-mobile-label">Quantity:</span>
                  <span className="vaye-mobile-value">1</span>
                </div>
                <div className="vaye-mobile-table-cell">
                  <span className="vaye-mobile-label">Net Amount:</span>
                  <span className="vaye-mobile-value">
                    ZAR {selectedInvoice.amount.replace("R ", "")}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Totals */}
            <div className="vaye-mobile-totals">
              <div className="vaye-mobile-total-row">
                <span>Total net amount</span>
                <span>ZAR {selectedInvoice.amount.replace("R ", "")}</span>
              </div>
              <div className="vaye-mobile-total-row final">
                <span>Total amount payable</span>
                <span>ZAR {selectedInvoice.amount.replace("R ", "")}</span>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="vaye-mobile-footer">
              <p>Issued on behalf of Nhlamulo Chauke by:</p>
              <p>Vaye B.V. | Burgemeestershuis 301, 1076 HR Amsterdam</p>
              <p>VAT: NL852071589B01 | COC #: 56317441</p>
            </div>
          </div>

          <button
            className="vaye-tax-button"
            onClick={() => handleDownload(selectedInvoice)}
            style={{ marginTop: "24px" }}
          >
            <IoDownload size={20} />
            Download PDF
          </button>
        </div>
      </div>
    );
  };

  if (selectedInvoice) {
    return renderInvoiceDetail();
  }

  return (
    <div className="vaye-tax-page">
      <header className="vaye-tax-header dark">
        <button className="vaye-tax-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-tax-title">Tax invoices</h1>
        <div style={{ width: "48px" }}></div>
      </header>

      <div className="vaye-tax-content">
        <div className="vaye-tax-tabs">
          <button
            className={`vaye-tax-tab ${activeTab === "trip" ? "active" : ""}`}
            onClick={() => setActiveTab("trip")}
          >
            Trip invoices
          </button>
          <button
            className={`vaye-tax-tab ${activeTab === "vaye" ? "active" : ""}`}
            onClick={() => setActiveTab("vaye")}
          >
            Invoices by Vaye
          </button>
          <button
            className={`vaye-tax-tab ${activeTab === "toVaye" ? "active" : ""}`}
            onClick={() => setActiveTab("toVaye")}
          >
            Invoices to Vaye
          </button>
        </div>

        <div className="vaye-invoice-list">
          {invoiceData[activeTab].map((invoice, index) => (
            <div
              key={index}
              className="vaye-invoice-item"
              onClick={() => handleInvoiceClick(invoice)}
            >
              <div className="vaye-invoice-number">{invoice.id}</div>
              <div className="vaye-invoice-details">
                <span className="vaye-invoice-date">Date: {invoice.date}</span>
                <span className="vaye-invoice-amount">
                  Amount: {invoice.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxInvoices;

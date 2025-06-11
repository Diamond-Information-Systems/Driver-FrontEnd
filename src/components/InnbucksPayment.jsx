import React from 'react';
import './InnbucksPayment.css';

const InnbucksPayment = ({ paymentCode, amount, onClose }) => {
  const innbucksDeepLink = `schinn.wbpycode://innbucks.co.zw?pymInnCode=${paymentCode}`;

  return (
    <div className="innbucks-payment-overlay">
      <div className="innbucks-payment-modal">
        <h2>InnBucks Payment</h2>
        <div className="payment-details">
          <p className="amount">Amount: ${amount}</p>
          <div className="payment-code">
            <label>Payment Code:</label>
            <span>{paymentCode}</span>
          </div>
        </div>
        
        <div className="payment-actions">
          <a 
            href={innbucksDeepLink}
            className="innbucks-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open InnBucks App
          </a>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InnbucksPayment;


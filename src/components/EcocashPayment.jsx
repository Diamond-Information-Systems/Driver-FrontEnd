import React, { useState, useEffect } from 'react';
import './EcocashPayment.css';
import api from '../api';

const EcocashPayment = ({ 
  transactionReference, 
  amount, 
  mobileNumber,
  onClose,
  onSuccess 
}) => {
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        // Use the correct endpoint and HTTP method
        const response = await api.get(
          `/api/payments/transaction/${transactionReference}/status`
        );

        console.log('Payment status check response:', response.data);

        // Check payment status
        if (response.data.status === 'PAID') {
          setPaymentStatus('PAID');
          setIsPolling(false);
          onSuccess();
        } else if (response.data.status === 'FAILED') {
          setPaymentStatus('FAILED');
          setIsPolling(false);
          setError('Payment failed. Please try again.');
        } else if (response.data.status === 'CANCELLED') {
          setPaymentStatus('CANCELLED');
          setIsPolling(false);
          setError('Payment was cancelled.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setError('Failed to check payment status. Please try again.');
        setIsPolling(false);
      }
    };

    let pollInterval;
    if (isPolling) {
      // Initial check
      pollStatus();
      // Set up polling interval
      pollInterval = setInterval(pollStatus, 5000);
    }

    // Cleanup interval on component unmount or when polling stops
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [transactionReference, isPolling, onSuccess]);

  return (
    <div className="ecocash-payment-overlay">
      <div className="ecocash-payment-modal">
        <h2>Ecocash Payment</h2>
        <div className="payment-details">
          <p className="amount">Amount: ${amount}</p>
          <p className="mobile">Mobile Number: {mobileNumber}</p>
          <div className="status-container">
            <p>Status: {paymentStatus}</p>
            {paymentStatus === 'PENDING' && (
              <div className="loading-spinner"></div>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
        
        <div className="payment-instructions">
          <p>Please check your phone for the USSD prompt to confirm payment.</p>
          <ol>
            <li>Enter your EcoCash PIN when prompted</li>
            <li>Confirm the payment amount</li>
            <li>Wait for confirmation message</li>
          </ol>
        </div>

        <button 
          className="close-button" 
          onClick={onClose}
          disabled={paymentStatus === 'PENDING'}
        >
          {paymentStatus === 'PENDING' ? 'Processing...' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default EcocashPayment;
import React, { useState } from 'react';
import api from '../api';
import './OmariPayment.css';

const OmariPayment = ({ 
  transactionReference, 
  amount, 
  mobileNumber,
  onClose,
  onSuccess 
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('WAITING_FOR_OTP');

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const response = await api.post('/api/payments/omari/confirm', {
        transactionReference,
        otp,
        omariMobile: mobileNumber
      });

      if (response.data.status === 'PAID') {
        setStatus('PAID');
        onSuccess();
      } else {
        setError('Payment verification failed. Please try again.');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="omari-payment-overlay">
      <div className="omari-payment-modal">
        <h2>Omari Payment</h2>
        <div className="payment-details">
          <p className="amount">Amount: ${amount}</p>
          <p className="mobile">Mobile Number: {mobileNumber}</p>
        </div>

        {status === 'WAITING_FOR_OTP' && (
          <form onSubmit={handleOtpSubmit} className="otp-form">
            <p className="instructions">
              Please enter the OTP sent to your mobile number
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              maxLength="6"
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button 
              type="submit" 
              className="verify-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <button 
          className="close-button"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OmariPayment;
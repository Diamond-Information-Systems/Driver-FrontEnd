import React, { useState, useEffect } from 'react';
import './SmileCashPayment.css';
import api from '../api';
import PaymentSuccess from './PaymentSuccess';

const SmileCashPayment = ({ 
  transactionReference,
  smileCashOrderReference,
  amount, 
  mobileNumber,
  onClose,
  onSuccess 
}) => {
  const [paymentStatus, setPaymentStatus] = useState('WAITING_FOR_OTP');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/api/payments/zb-payment/confirm', {
        otp,
        transactionReference
      });

      if (response.data.Status === 'COMPLETED') {
        setPaymentStatus('PAID');
        setShowSuccess(true);
     
      } else {
        setError('Payment verification failed. Please try again.');
        setPaymentStatus('FAILED');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start polling only after OTP is confirmed
  useEffect(() => {
    let pollInterval;
    if (isPolling) {
      const pollStatus = async () => {
        try {
          const response = await api.get(
            `/api/payments/transaction/${smileCashOrderReference}/status`
          );

          if (response.data.status === 'PAID') {
            setPaymentStatus('PAID');
            setIsPolling(false);
            onSuccess();
          } else if (response.data.status === 'FAILED') {
            setPaymentStatus('FAILED');
            setIsPolling(false);
            setError('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          setError('Failed to check payment status');
          setIsPolling(false);
        }
      };

      pollStatus();
      pollInterval = setInterval(pollStatus, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [transactionReference, isPolling, onSuccess]);

  return (
    <div className="smilecash-payment-overlay">
      <div className="smilecash-payment-modal">
          {!showSuccess ? (
          <>
        <h2>SmileCash Payment</h2>
        <div className="payment-details">
          <p className="amount">Amount: ${amount}</p>
          <p className="mobile">Mobile Number: {mobileNumber}</p>
          
          {paymentStatus === 'WAITING_FOR_OTP' && (
            <form onSubmit={handleOtpSubmit} className="otp-form">
              <p className="otp-instructions">
                Enter the OTP sent to your mobile number
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength="6"
                required
                className="otp-input"
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="verify-button"
                disabled={isSubmitting || !otp}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {paymentStatus !== 'WAITING_FOR_OTP' && (
            <div className="status-container">
              <p>Status: {paymentStatus}</p>
              {paymentStatus === 'PENDING' && (
                <div className="loading-spinner"></div>
              )}
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
        </div>

        <button 
          className="close-button" 
          onClick={onClose}
          disabled={isSubmitting || paymentStatus === 'PENDING'}
        >
          {isSubmitting ? 'Processing...' : 'Close'}
        </button>
        </>
            ) : (
          <PaymentSuccess 
            onComplete={() => {
              setShowSuccess(false);
              onSuccess();
            }} 
          />
        )} 
      </div>
      

    </div>
  );
};

export default SmileCashPayment;
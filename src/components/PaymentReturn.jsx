import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import PaymentSuccess from './PaymentSuccess';

const PaymentReturn = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const transactionReference = params.get('transactionReference');
        const paRes = params.get('PaRes');

        if (transactionReference && paRes) {
          // Call your backend to handle 3DS verification
          await api.post('/api/payments/card/auth-callback', {
            transactionReference,
            paRes
          });

          //if the payment is successful show success page
          <PaymentSuccess />

          //pause for a moment to show success message
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Redirect back to dashboard or success page
          navigate('/');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        navigate('/payment/failed');
      }
    };

    handlePaymentReturn();
  }, [location, navigate]);

  return (
    <div className="payment-return">
      <h2>Verifying Payment...</h2>
      {/* Add loading spinner here */}
    </div>
  );
};

export default PaymentReturn;
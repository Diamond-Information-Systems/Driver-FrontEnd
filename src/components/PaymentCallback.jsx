import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    
    // Redirect based on payment status
    if (status === 'PAID') {
      navigate('/payment/success');
    } else {
      navigate('/payment/failed');
    }
  }, [location, navigate]);

  return (
    <div className="payment-callback">
      <h2>Processing Payment...</h2>
      {/* Add loading spinner here */}
    </div>
  );
};

export default PaymentCallback;
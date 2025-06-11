import api from '../api';
import config from '../config';


export const initiatePayment = async (paymentDetails) => {
    const apiUrl = config.apiBaseUrl;
    //log payment details
    console.log('Initiating payment with details:', paymentDetails);
  try {
    const response = await api.post('/api/payments/initiate', {
      orderReference: paymentDetails.orderReference,
      amount: paymentDetails.amount,
      returnUrl: `${window.location.origin}/payment/return`,
      resultUrl: `https://f828-102-182-102-202.ngrok-free.app/api/payments/webhook`,
      itemName: 'Ride Payment',
      itemDescription: `Ride from ${paymentDetails.pickup} to ${paymentDetails.dropoff}`,
      currencyCode: '840', // 840 is the code for USD,adjust as needed
      firstName: paymentDetails.passengerName.split(' ')[0],
      lastName: paymentDetails.passengerName.split(' ')[1] || '',
      mobilePhoneNumber: paymentDetails.phoneNumber,
      email: paymentDetails.email,
      paymentMethod: paymentDetails.paymentMethod || 'WALLETPLUS', // Default to WALLETPLUS if not specified    
      cancelUrl: `${window.location.origin}/payment/cancel`
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Payment initiation failed');
  }
};

export const initiateCardPayment = async (paymentDetails) => {
  const apiUrl = config.apiBaseUrl;
  
  // Log payment details with masked card info for security
  const loggableDetails = {
    ...paymentDetails,
    pan: paymentDetails.pan ? `****${paymentDetails.pan.slice(-4)}` : undefined,
    securityCode: '***'
  };
  console.log('Initiating card payment with details:', loggableDetails);

  try {
    const response = await api.post('/api/payments/initiate', {
      // Required string fields
      orderReference: paymentDetails.orderReference,
      itemName: paymentDetails.itemName || 'Ride Payment',
      itemDescription: paymentDetails.itemDescription || `Ride from ${paymentDetails.pickup} to ${paymentDetails.dropoff}`,
      
      // Required number field
      amount: parseFloat(paymentDetails.amount),
      
      // URLs
      returnUrl: `${window.location.origin}/payment/return?transactionReference=${paymentDetails.orderReference}`,
      resultUrl: `https://f828-102-182-102-202.ngrok-free.app/api/payments/webhook`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
      failureUrl:`${window.location.origin}/payment/failed`,
      
      // User details
      firstName: paymentDetails.firstName || paymentDetails.passengerName?.split(' ')[0] || '',
      lastName: paymentDetails.lastName || paymentDetails.passengerName?.split(' ')[1] || '',
      mobilePhoneNumber: paymentDetails.mobilePhoneNumber || paymentDetails.phoneNumber,
      email: paymentDetails.email,
      
      // Payment specific fields
      currencyCode: paymentDetails.currencyCode || '840', // USD by default
      paymentMethod: 'CARD',
      
      // Card specific fields
      pan: paymentDetails.pan,
      expMonth: paymentDetails.expMonth,
      expYear: paymentDetails.expYear,
      securityCode: paymentDetails.securityCode
    });

    // Log success (without sensitive data)
    console.log('Card payment initiated successfully:', {
     response: response.data,
    });

    return response;
  } catch (error) {
    // Log error (without sensitive data)
    console.error('Card payment initiation failed:', {
      message: error.response?.data?.error || error.message,
      code: error.response?.status
    });
    
    throw new Error(error.response?.data?.error || 'Card payment initiation failed');
  }
};
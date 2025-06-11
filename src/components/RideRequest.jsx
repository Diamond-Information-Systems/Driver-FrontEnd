import React, { useState } from 'react';
import { Star, Navigation, Clock, DollarSign, MapPin, Users } from 'lucide-react';
import { initiatePayment } from '../services/paymentService';
import './RideRequest.css';
import InnbucksPayment from './InnbucksPayment'; // Import the InnbucksPayment component
import EcocashPayment from './EcocashPayment'; // Import the EcocashPayment component
import OmariPayment from './OmariPayment'; // Import the OmariPayment component
import SmileCashPayment from './SmileCashPayment'; // Import the SmileCashPayment component
import CardPayment from './CardPayment'; // Import the CardPayment component

// Add this constant at the top of the file, outside the component
const PAYMENT_METHODS = [
  { id: 'ECOCASH', name: 'Ecocash', description: 'Mobile Money' },
  { id: 'INNBUCKS', name: 'Innbucks', description: 'Digital Wallet' },
  { id: 'OMARI', name: 'Omari', description: 'Payment Platform' },
  { id: 'CARD', name: 'Visa/Mastercard', description: 'Credit/Debit Cards' },
  { id: 'SMILECASH', name: 'Smile Cash', description: 'Digital Wallet' },
  { id: 'WALLETPLUS', name: 'WalletPlus', description: 'WalletPlus Payment' } // Add WalletPlus as a default option
];


const RideRequest = ({ 
  request, 
  onAccept, 
  onDecline, 
  timeRemaining 
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const {
      isCarpool,
      passengers,
      estimatedPrice,
      estimatedTotalDistance,
      estimatedTotalDuration,
      stops
    } = request;
      const [innbucksPaymentCode, setInnbucksPaymentCode] = useState(null);

      const [ecocashTransactionRef, setEcocashTransactionRef] = useState(null);
      const [ecocashOrderReference, setEcocashOrderReference] = useState(null);

      const [omariOrderReference, setOmariOrderReference] = useState(null);
      const [omariTransactionRef, setOmariTransactionRef] = useState(null);

      const [smileCashOrderReference, setSmileCashOrderReference] = useState(null);
      const [smileCashTransactionRef, setSmileCashTransactionRef] = useState(null);

      const [cardPaymentData, setCardPaymentData] = useState(null);

   const handleAccept = async () => {
     if (!selectedPayment) {
      setShowPaymentModal(true);
      return;
    }
    try {
      setIsProcessing(true);
      
      // Generate unique order reference
      const orderReference = `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get first passenger for non-carpool rides
      const passenger = isCarpool ? passengers[0] : passengers;

      //log passenger details for debugging
      console.log('Passenger details:', passenger);

 
      
      // Prepare payment details
      const paymentDetails = {
        orderReference,
        amount: estimatedPrice,
        pickup: stops[0].location,
        dropoff: stops[stops.length - 1].location,
        passengerName: passenger.name || "John Doe", // Fallback name
        phoneNumber: passenger.phoneNumber || "0772635490", // Fallback phone number
        email: "1@example.com",
        paymentMethod: selectedPayment ? selectedPayment.id : 'WALLETPLUS' // Default to WALLETPLUS if not selected
      };

      // Log payment details for debugging
      console.log('Payment details:', paymentDetails);

      // Initiate payment
      const paymentResponse = await initiatePayment(paymentDetails);
      
// Log payment response for debugging
      console.log('Payment response:', paymentResponse);

      // If payment initiated successfully, redirect to payment URL
      if (paymentResponse.data.PaymentUrl) {
        window.location.href = paymentResponse.data.PaymentUrl;
      }



      // Call original onAccept callback
      onAccept(request);
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      // Handle error (show error message to user)
    } finally {
      setIsProcessing(false);
    }
  };

    // Add payment method selection handler
  const handlePaymentSelect = async (methodId) => {
    setSelectedPayment(methodId);
    setShowPaymentModal(false);
        // Prepare payment details
    
       if (methodId === 'ECOCASH') 
        {
        try {
          setIsProcessing(true);
          const orderReference = `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const response = await initiatePayment({
            orderReference: orderReference,
            amount: estimatedPrice,
            pickup: stops[0].location,
            dropoff: stops[stops.length - 1].location,
            passengerName: passengers[0].name,
            phoneNumber: passengers[0].phoneNumber,
            email: passengers[0].email,
            paymentMethod: 'ECOCASH',
            ecocashMobile: passengers[0].phoneNumber // Required for Ecocash
          });
          
          setEcocashTransactionRef(orderReference);
          setEcocashOrderReference(orderReference);
        } catch (error) {
          console.error('Ecocash payment initiation failed:', error);
        } finally {
          setIsProcessing(false);
        }
      }
     else if (methodId === 'INNBUCKS') 
      {
      try {
        setIsProcessing(true);
        const response = await initiatePayment({
          // ...payment details
          orderReference: `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          amount: estimatedPrice,
          pickup: stops[0].location,
          dropoff: stops[stops.length - 1].location,
          passengerName: passengers[0].name || "John Doe", // Fallback name
          phoneNumber: passengers[0].phoneNumber || "123-456-7890", // Fallback phone number
          email: passengers[0].email || "1@example.com",
          paymentMethod: 'INNBUCKS'
        });
        // Log response for debugging
        console.log('InnBucks payment response:', response);
        // Extract payment code from response
        const paymentCode = response.data?.InnbucksPaymentCode;
        setInnbucksPaymentCode(paymentCode);
      } catch (error) {
        console.error('InnBucks payment initiation failed:', error);
      } finally {
        setIsProcessing(false);
      }
    } 
    else if (methodId === 'OMARI') 
      {
      try {
        setIsProcessing(true);
        const orderReference = `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const response = await initiatePayment({
          orderReference: orderReference,
          amount: estimatedPrice,
          pickup: stops[0].location,
          dropoff: stops[stops.length - 1].location,
          passengerName: passengers[0].name,
          phoneNumber: passengers[0].phoneNumber,
          email: passengers[0].email,
          paymentMethod: 'OMARI',
          omariMobile: passengers[0].phoneNumber
        });
        
        setOmariTransactionRef(response.data?.TransactionReference);
        setOmariOrderReference(orderReference);
        // Log response for debugging
        console.log('Omari payment response:', response);
      } catch (error) {
        console.error('Omari payment initiation failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
    else if (methodId === 'SMILECASH') 
      {
      try {
        setIsProcessing(true);
        const orderReference = `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const response = await initiatePayment({
          orderReference,
          amount: estimatedPrice,
          pickup: stops[0].location,
          dropoff: stops[stops.length - 1].location,
          passengerName: passengers[0].name,
          phoneNumber: passengers[0].phoneNumber,
          email: passengers[0].email,
          paymentMethod: 'SMILECASH',
          zbWalletMobile: passengers[0].phoneNumber // Required for SmileCash
        });
        
        setSmileCashTransactionRef(response.data?.TransactionReference);
        setSmileCashOrderReference(orderReference);
        console.log('SmileCash payment response:', response);
      } catch (error) {
        console.error('SmileCash payment initiation failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
   else if (methodId === 'CARD') 
    {
      try {
        setIsProcessing(true);
        const orderReference = `RIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Set initial card payment data - don't make API call yet
        setCardPaymentData({
          orderReference,
          amount: estimatedPrice,
          returnUrl: `${window.location.origin}/payment/return`,
          resultUrl: `${window.location.origin}/api/payments/webhook`,
          itemName: 'Ride Payment',
          itemDescription: `Ride from ${stops[0].location} to ${stops[stops.length - 1].location}`,
          currencyCode: '840', // ZWL currency code
          firstName: passengers[0].name?.split(' ')[0] || '',
          lastName: passengers[0].name?.split(' ')[1] || '',
          mobilePhoneNumber: passengers[0].phoneNumber,
          email: passengers[0].email || '',
          paymentMethod: 'CARD',
          cancelUrl: `${window.location.origin}/payment/cancel`,
          failureUrl: `${window.location.origin}/payment/failed`
        });

      } catch (error) {
        console.error('Card payment setup failed:', error);
      } finally {
        setIsProcessing(false);
      }
  } 
  else 
  {
    handleAccept();
  }
};

// Add payment method modal component
const renderPaymentModal = () => (
  <div className="payment-modal-overlay">
    <div className="payment-modal">
        <h2>Select Payment Method</h2>
        <div className="payment-methods">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              className="payment-method-button"
              onClick={() => handlePaymentSelect(method.id)}
            >
              <span className="method-name">{method.name}</span>
              <span className="method-description">{method.description}</span>
            </button>
          ))}
        </div>
        <button 
          className="close-modal"
          onClick={() => setShowPaymentModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );




  const renderPassengerInfo = (passenger) => (
    <div className="passenger-info" key={passenger.id}>
      <h3>{passenger.name}</h3>
      <div className="rating">
        <Star size={16} fill="#ffd43b" stroke="#ffd43b" />
        <span>{passenger.rating}</span>
      </div>
    </div>
  );

  const renderStops = () => (
    <div className="request-details">
      {stops.map((stop, index) => (
        <div key={index} className={`location-detail ${index === 0 ? 'pickup' : 'dropoff'}`}>
          <div className="stop-indicator">
            {index === 0 ? <MapPin size={20} /> : <Navigation size={20} />}
            {isCarpool && (
              <div className="passenger-label">
                <Users size={14} />
                <span>{stop.passengerName}</span>
              </div>
            )}
          </div>
          <p>{stop.location}</p>
          {stop.estimatedPrice && (
            <div className="stop-price">
              <DollarSign size={14} />
              <span>${stop.estimatedPrice}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="ride-request-overlay">
      <div className="ride-request-card">
        <div className="request-timer">
          <div 
            className="timer-bar" 
            style={{ animationDuration: `${timeRemaining}s` }} 
          />
        </div>

        <div className="request-header">
          {isCarpool ? (
            <div className="carpool-header">
              <div className="carpool-indicator">
                <Users size={20} />
                <span>Carpool · {passengers.length} passengers</span>
              </div>
              <div className="total-price">
                <DollarSign size={20} />
                <span>${estimatedPrice}</span>
              </div>
            </div>
          ) : (
            <>
              {renderPassengerInfo(passengers[0])}
              <div className="estimated-price">
                <DollarSign size={20} />
                <span>${estimatedPrice}</span>
              </div>
            </>
          )}
        </div>

        {renderStops()}

        <div className="trip-metrics">
          <div className="metric">
            <Navigation size={16} />
            <span>{estimatedTotalDistance} km</span>
          </div>
          <div className="metric">
            <Clock size={16} />
            <span>{estimatedTotalDuration} min</span>
          </div>
        </div>

        <div className="request-actions">
          <button 
            className="action-button decline"
            onClick={onDecline}
          >
            Decline
          </button>
          <button 
            className="action-button accept"
            onClick={handleAccept}
          disabled={isProcessing}
          >
           {isProcessing ? 'Processing...' : 'Accept'}
          </button>
        </div>
      </div>
       {showPaymentModal && renderPaymentModal()}
        {innbucksPaymentCode && (
        <InnbucksPayment
          paymentCode={innbucksPaymentCode}
          amount={estimatedPrice}
          onClose={() => setInnbucksPaymentCode(null)}
        />
      )}

        {ecocashTransactionRef && (
      <EcocashPayment
        transactionReference={ecocashTransactionRef}
        amount={estimatedPrice}
        mobileNumber={passengers[0].phoneNumber}
        onClose={() => setEcocashTransactionRef(null)}
        onSuccess={() => {
          setEcocashTransactionRef(null);
          onAccept(request);
        }}
      />
    )}

         {omariTransactionRef && (
        <OmariPayment
          transactionReference={omariTransactionRef}
          amount={estimatedPrice}
          mobileNumber={passengers[0].phoneNumber}
          onClose={() => setOmariTransactionRef(null)}
          onSuccess={() => {
            setOmariTransactionRef(null);
            onAccept(request);
          }}
        />
      )}

       {smileCashTransactionRef && (
        <SmileCashPayment
          transactionReference={smileCashTransactionRef}
          orderReference={smileCashOrderReference}
          amount={estimatedPrice}
          mobileNumber={passengers[0].phoneNumber}
          onClose={() => setSmileCashTransactionRef(null)}
          onSuccess={() => {
            setSmileCashTransactionRef(null);
            onAccept(request);
          }}
        />
      )}

      {cardPaymentData && (
  <CardPayment
    paymentData={cardPaymentData}
    amount={estimatedPrice}
    onClose={() => setCardPaymentData(null)}
    onSuccess={() => {
      setCardPaymentData(null);
      onAccept(request);
    }}
  />
)}

    </div>
  );
};

export default RideRequest;
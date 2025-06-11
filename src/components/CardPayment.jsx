import React, { useState, useEffect,useRef } from 'react';
import './CardPayment.css';
import {initiateCardPayment} from '../services/paymentService'; // Adjust the import based on your API structure

const CardPayment = ({ 
  paymentData,
  amount,
  onClose,
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    pan: '',
    expMonth: '',
    expYear: '',
    securityCode: ''
  });
  const [step, setStep] = useState('CARD_INPUT'); // CARD_INPUT, PROCESSING, REDIRECTING
  const containerRef = useRef(null);
  const [redirectData, setRedirectData] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStep('PROCESSING');
    
// try {
//         const response = await initiateCardPayment({
//             ...paymentData,
//             ...cardDetails
//         });

//             //       {
//             //     "ResponseMessage": "Payer authentication successful",
//             //     "ResponseCode": null,
//             //     "Status": null,
//             //     "TransactionReference": "MQFE6738TJSU",
//             //     "GatewayRecommendation": "PROCEED",
//             //     "AuthenticationStatus": "AUTHENTICATION_PENDING",
//             //     "RedirectHtml": "<div id=\"threedsChallengeRedirect\" xmlns=\"http://www.w3.org/1999/html\" style=\" height: 100vh\"> <form id =\"threedsChallengeRedirectForm\" method=\"POST\" action=\"https://mtf.gateway.mastercard.com/acs/mastercard/v2/prompt\" target=\"challengeFrame\"> <input type=\"hidden\" name=\"creq\" value=\"eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjNlZjU4Njg4LTdhZmItNDFjYS1iZTZkLTRlNzMwNDJhNzc3MSJ9\" /> </form> <iframe id=\"challengeFrame\" name=\"challengeFrame\" width=\"100%\" height=\"100%\" ></iframe> <script id=\"authenticate-payer-script\"> var e=document.getElementById(\"threedsChallengeRedirectForm\"); if (e) { e.submit(); if (e.parentNode !== null) { e.parentNode.removeChild(e); } } </script> </div>",
//             //     "CustomizedHtml": {
//             //         "3ds2": {
//             //             "acsUrl": "https://mtf.gateway.mastercard.com/acs/mastercard/v2/prompt",
//             //             "cReq": "eyJ0aHJlZURTU2VydmVyVHJhbnNJRCI6IjNlZjU4Njg4LTdhZmItNDFjYS1iZTZkLTRlNzMwNDJhNzc3MSJ9"
//             //         }
//             //     },
//             //     "initiatedPayment": "6840265d8ce5e25250399415"
//             // }

//             // Wait for next render cycle to ensure container is mounted
//         await new Promise(resolve => setTimeout(resolve, 0));

//         setStep('REDIRECTING');

//         // Use the ref instead of getElementById
//         if (!containerRef.current) {
//         throw new Error('3DS container not found');
//         }

//         // Clear any existing content
//         containerRef.current.innerHTML = '';

//         // Method 1: Handle redirectHtml
//         if (response.data?.RedirectHtml) {
//             const iframe = document.createElement('iframe');
//             iframe.srcdoc = response.data.RedirectHtml;
//             iframe.style.width = '100%';
//             iframe.style.height = '600px';
//             iframe.style.border = 'none';
//             containerRef.current.appendChild(iframe);
//         } 
//         // Method 2: Handle customizedHtml (fallback)
//         else if (response.data?.CustomizedHtml?.['3ds2']) {
//             const { acsUrl, cReq } = response.data.CustomizedHtml['3ds2'];
//             const iframe = document.createElement('iframe');
//             iframe.style.width = '100%';
//             iframe.style.height = '600px';
//             iframe.style.border = 'none';
//             containerRef.current.appendChild(iframe);

//             const form = document.createElement('form');
//             form.method = 'POST';
//             form.action = acsUrl;
            
//             const input = document.createElement('input');
//             input.type = 'hidden';
//             input.name = 'creq';
//             input.value = cReq;
            
//             form.appendChild(input);
//             iframe.contentDocument.body.appendChild(form);
//             form.submit();
//         } else {
//             throw new Error('No 3DS redirect information received');
//         }
//     } catch (error) {
//     console.error('Card payment failed:', error);
//     setStep('CARD_INPUT');
//     }
//   };

const handleSubmit = async (e) => 
    {
        e.preventDefault();
        setStep('PROCESSING');
        
        try {
            const response = await initiateCardPayment({
            ...paymentData,
            ...cardDetails
            });

            // Store the redirect data and change step
            setRedirectData(response.data);
            setStep('REDIRECTING');

        } catch (error) {
            console.error('Card payment failed:', error);
            setStep('CARD_INPUT');
        }
    };

    // Add useEffect to handle redirect after render
useEffect(() => 
{
    const handleRedirect = async () => 
    {
        if (step === 'REDIRECTING' && redirectData && containerRef.current) 
        {
            try 
            {
                // Clear any existing content
                containerRef.current.innerHTML = '';

                // Method 1: Handle redirectHtml
                if (redirectData.RedirectHtml) 
                {
                    // Create a temporary form and submit it to handle the redirect
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = redirectData.RedirectHtml.match(/action="([^"]+)"/)?.[1];
                    
                    // Extract creq value from RedirectHtml
                    const creqMatch = redirectData.RedirectHtml.match(/value="([^"]+)"/);
                    if (creqMatch) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'creq';
                        input.value = creqMatch[1];
                        form.appendChild(input);
                    }

                    document.body.appendChild(form);
                    form.submit();
                } 
                // Method 2: Handle customizedHtml (fallback)
                else if (redirectData.CustomizedHtml?.['3ds2']) 
                {
                    const { acsUrl, cReq } = redirectData.CustomizedHtml['3ds2'];
                    const iframe = document.createElement('iframe');
                    iframe.style.width = '100%';
                    iframe.style.height = '600px';
                    iframe.style.border = 'none';
                    containerRef.current.appendChild(iframe);

                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = acsUrl;
                    
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'creq';
                    input.value = cReq;
                    
                    form.appendChild(input);
                    iframe.contentDocument.body.appendChild(form);
                    form.submit();
                }
            } catch (error) {
                console.error('3DS redirect failed:', error);
                setStep('CARD_INPUT');
            }
        }
  };

  handleRedirect();
}, [step, redirectData]);

  return (
    <div className="card-payment-overlay">
      <div className="card-payment-modal">
        <h2>Card Payment</h2>
        <div className="payment-amount">
          <span>Amount: ${amount}</span>
        </div>
        
        {step === 'CARD_INPUT' && (
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input 
                type="text"
                value={cardDetails.pan}
                onChange={e => setCardDetails({...cardDetails, pan: e.target.value})}
                placeholder="1234 5678 9012 3456"
                required
                maxLength="16"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Month</label>
                <input 
                  type="text"
                  value={cardDetails.expMonth}
                  onChange={e => setCardDetails({...cardDetails, expMonth: e.target.value})}
                  placeholder="MM"
                  required
                  maxLength="2"
                />
              </div>
              <div className="form-group">
                <label>Expiry Year</label>
                <input 
                  type="text"
                  value={cardDetails.expYear}
                  onChange={e => setCardDetails({...cardDetails, expYear: e.target.value})}
                  placeholder="YY"
                  required
                  maxLength="2"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input 
                  type="password"
                  value={cardDetails.securityCode}
                  onChange={e => setCardDetails({...cardDetails, securityCode: e.target.value})}
                  placeholder="123"
                  required
                  maxLength="4"
                />
              </div>
            </div>

            <button type="submit" className="submit-button">
              Pay Now
            </button>
          </form>
        )}

        {step === 'PROCESSING' && (
          <div className="processing">
            <p>Processing your card...</p>
            <div className="loading-spinner"></div>
          </div>
        )}

        {step === 'REDIRECTING' && (
          <div className="secure-3ds">
            <p>Complete Secure Verification</p>
            <div ref={containerRef} className="threeds-container"></div>
          </div>
        )}

        <button 
          className="close-button"
          onClick={onClose}
          disabled={step !== 'CARD_INPUT'}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CardPayment;
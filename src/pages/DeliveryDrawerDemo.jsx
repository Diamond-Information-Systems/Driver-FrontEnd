import React, { useState } from 'react';
import DeliveryDrawer from '../components/DeliveryDrawer/DeliveryDrawer';

const DeliveryDrawerDemo = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [demoState, setDemoState] = useState('idle'); // idle, request, active, completed

  const mockDeliveryRequest = {
    _id: 'demo-delivery-123',
    customer: {
      name: 'John Doe',
      phone: '+263771234567'
    },
    items: [
      {
        name: 'Pizza Margherita',
        price: 15.99,
        description: 'Fresh mozzarella, tomato sauce, basil',
        image: '/images/Delivery.png'
      },
      {
        name: 'Chicken Wings',
        price: 12.50,
        description: '8 pieces with BBQ sauce',
        image: '/images/Delivery.png'
      }
    ],
    pickup: {
      address: '123 Restaurant Street, Downtown',
      coordinates: { lat: -26.2041, lng: 28.0473 }
    },
    dropoff: {
      address: '456 Customer Avenue, Suburb',
      coordinates: { lat: -26.1941, lng: 28.0573 }
    },
    deliveryFee: 5.00,
    totalAmount: 33.49,
    estimatedDuration: '25 mins',
    notes: 'Ring doorbell twice. Leave at door if no answer.',
    pin: '1234'
  };

  const mockActiveDelivery = {
    ...mockDeliveryRequest,
    status: 'picked_up',
    startTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };

  const mockCompletedDelivery = {
    ...mockDeliveryRequest,
    status: 'delivered',
    completedAt: new Date().toISOString(),
    earnings: 8.50,
    duration: '22 mins',
    rating: 5
  };

  const mockTodayStats = {
    earnings: 125.50,
    deliveries: 8,
    hours: 4.2,
    rating: 4.8
  };

  const handleAcceptRequest = () => {
    console.log('✅ Delivery request accepted');
    setDemoState('active');
  };

  const handleDeclineRequest = () => {
    console.log('❌ Delivery request declined');
    setDemoState('idle');
  };

  const handleDeliveryAction = (action, deliveryId) => {
    console.log('🚚 Delivery action:', action, deliveryId);
    
    switch (action) {
      case 'start_delivery':
        setDemoState('active');
        break;
      case 'pickup_completed':
        console.log('📦 Pickup completed');
        break;
      case 'delivery_completed':
        setDemoState('completed');
        break;
      case 'mark_completed':
        setDemoState('idle');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleDeliveryClose = () => {
    console.log('🔄 Delivery closed, returning to idle');
    setDemoState('idle');
  };

  return (
    <div style={{ 
      height: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>
        Delivery Drawer Demo
      </h1>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ color: 'white', marginBottom: '10px' }}>
          <strong>Demo Controls:</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setDemoState('idle')}
            style={{
              padding: '8px 16px',
              background: demoState === 'idle' ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Idle State
          </button>
          <button 
            onClick={() => setDemoState('request')}
            style={{
              padding: '8px 16px',
              background: demoState === 'request' ? '#FF9500' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delivery Request
          </button>
          <button 
            onClick={() => setDemoState('active')}
            style={{
              padding: '8px 16px',
              background: demoState === 'active' ? '#2196F3' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Active Delivery
          </button>
          <button 
            onClick={() => setDemoState('completed')}
            style={{
              padding: '8px 16px',
              background: demoState === 'completed' ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Completed
          </button>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
            />
            Driver Online
          </label>
        </div>
      </div>

      <DeliveryDrawer
        isOnline={isOnline}
        deliveryRequest={demoState === 'request' ? mockDeliveryRequest : null}
        requestTimer={15}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
        activeDelivery={demoState === 'active' ? mockActiveDelivery : null}
        onDeliveryAction={handleDeliveryAction}
        completedDelivery={demoState === 'completed' ? mockCompletedDelivery : null}
        onDeliveryClose={handleDeliveryClose}
        todayStats={mockTodayStats}
      />
    </div>
  );
};

export default DeliveryDrawerDemo;

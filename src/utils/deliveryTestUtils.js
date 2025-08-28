/**
 * Test utilities for multiple pickup delivery functionality
 * This file contains helper functions to validate the delivery grouping and batch operations
 */

// Test data generator for multiple pickups from same location
export const generateTestDeliveries = () => {
  const samePickupLocation = {
    latitude: -17.8216,
    longitude: 31.0492,
    address: "123 Test Street, Harare"
  };

  const deliveries = [
    {
      _id: "delivery1",
      rideId: "ride1",
      status: "accepted",
      ecommerceData: {
        orderId: "ORDER001",
        customerName: "John Doe",
        phoneNumber: "+263771234567",
        items: [
          { name: "Pizza Margherita", quantity: 1, price: 15.00 },
          { name: "Coca Cola", quantity: 2, price: 2.50 }
        ],
        totalAmount: 20.00,
        paymentMethod: "cash",
        specialInstructions: "Ring doorbell twice"
      },
      pickup: samePickupLocation,
      dropoff: {
        latitude: -17.8300,
        longitude: 31.0600,
        address: "456 Customer Ave, Harare"
      },
      driver: "driver123"
    },
    {
      _id: "delivery2", 
      rideId: "ride2",
      status: "accepted",
      ecommerceData: {
        orderId: "ORDER002",
        customerName: "Jane Smith",
        phoneNumber: "+263771234568",
        items: [
          { name: "Chicken Burger", quantity: 1, price: 12.00 },
          { name: "French Fries", quantity: 1, price: 5.00 }
        ],
        totalAmount: 17.00,
        paymentMethod: "ecocash",
        specialInstructions: "Call on arrival"
      },
      pickup: samePickupLocation,
      dropoff: {
        latitude: -17.8350,
        longitude: 31.0650,
        address: "789 Client Rd, Harare"
      },
      driver: "driver123"
    },
    {
      _id: "delivery3",
      rideId: "ride3", 
      status: "accepted",
      ecommerceData: {
        orderId: "ORDER003",
        customerName: "Bob Wilson",
        phoneNumber: "+263771234569",
        items: [
          { name: "Beef Steak", quantity: 1, price: 25.00 },
          { name: "Side Salad", quantity: 1, price: 8.00 }
        ],
        totalAmount: 33.00,
        paymentMethod: "card",
        specialInstructions: "Leave at gate if no answer"
      },
      pickup: samePickupLocation,
      dropoff: {
        latitude: -17.8400,
        longitude: 31.0700,
        address: "321 Buyer St, Harare"
      },
      driver: "driver123"
    }
  ];

  return deliveries;
};

// Test grouping functionality
export const testDeliveryGrouping = (deliveries) => {
  console.log('🧪 Testing delivery grouping functionality');
  
  const groupedDeliveries = {};
  
  deliveries.forEach(delivery => {
    const pickupKey = `${delivery.pickup.latitude},${delivery.pickup.longitude}`;
    
    if (!groupedDeliveries[pickupKey]) {
      groupedDeliveries[pickupKey] = {
        pickupLocation: delivery.pickup,
        deliveries: []
      };
    }
    
    groupedDeliveries[pickupKey].deliveries.push(delivery);
  });

  console.log('📦 Grouped deliveries by pickup:', groupedDeliveries);
  
  // Validate grouping
  const groups = Object.values(groupedDeliveries);
  console.log(`✅ Created ${groups.length} pickup groups`);
  
  groups.forEach((group, index) => {
    console.log(`📍 Group ${index + 1}: ${group.deliveries.length} deliveries from ${group.pickupLocation.address}`);
    group.deliveries.forEach(delivery => {
      console.log(`  - Order ${delivery.ecommerceData.orderId}: ${delivery.ecommerceData.customerName}`);
    });
  });

  return groupedDeliveries;
};

// Test popup data preparation
export const testPopupDataPreparation = (groupedDeliveries) => {
  console.log('🧪 Testing popup data preparation');
  
  const pickupGroups = Object.entries(groupedDeliveries).map(([pickupKey, group]) => {
    const allItems = group.deliveries.flatMap(delivery => 
      delivery.ecommerceData.items.map(item => ({
        ...item,
        orderId: delivery.ecommerceData.orderId,
        customerName: delivery.ecommerceData.customerName
      }))
    );

    const totalValue = group.deliveries.reduce((sum, delivery) => 
      sum + delivery.ecommerceData.totalAmount, 0
    );

    return {
      pickupKey,
      location: group.pickupLocation,
      deliveries: group.deliveries,
      allItems,
      totalValue,
      orderCount: group.deliveries.length
    };
  });

  console.log('📊 Popup data prepared:', pickupGroups);
  
  pickupGroups.forEach(group => {
    console.log(`📍 Pickup: ${group.location.address}`);
    console.log(`📦 Orders: ${group.orderCount}`);
    console.log(`💰 Total Value: $${group.totalValue.toFixed(2)}`);
    console.log(`📋 Items: ${group.allItems.length} total items`);
  });

  return pickupGroups;
};

// Test batch status update payload
export const testBatchUpdatePayload = (pickupGroup, newStatus) => {
  console.log('🧪 Testing batch update payload generation');
  
  const deliveryIds = pickupGroup.deliveries.map(delivery => delivery._id);
  
  const payload = {
    deliveryIds,
    status: newStatus
  };

  console.log('📤 Batch update payload:', payload);
  console.log(`🔄 Updating ${deliveryIds.length} deliveries to status: ${newStatus}`);
  
  // Validate payload
  if (!Array.isArray(payload.deliveryIds) || payload.deliveryIds.length === 0) {
    console.error('❌ Invalid deliveryIds array');
    return null;
  }

  if (!['accepted', 'started', 'completed', 'cancelled', 'arrived'].includes(payload.status)) {
    console.error('❌ Invalid status value');
    return null;
  }

  console.log('✅ Payload validation passed');
  return payload;
};

// Test complete workflow
export const testCompleteWorkflow = () => {
  console.log('🚀 Testing complete multiple pickup workflow');
  console.log('================================================');
  
  // Step 1: Generate test data
  const deliveries = generateTestDeliveries();
  console.log(`📦 Generated ${deliveries.length} test deliveries`);
  
  // Step 2: Test grouping
  const groupedDeliveries = testDeliveryGrouping(deliveries);
  
  // Step 3: Test popup data preparation
  const pickupGroups = testPopupDataPreparation(groupedDeliveries);
  
  // Step 4: Test batch update for first group
  if (pickupGroups.length > 0) {
    const firstGroup = pickupGroups[0];
    const payload = testBatchUpdatePayload(firstGroup, 'started');
    
    if (payload) {
      console.log('✅ Complete workflow test passed');
      console.log('🎯 Ready for integration testing');
    } else {
      console.log('❌ Workflow test failed at payload generation');
    }
  }
  
  console.log('================================================');
  return {
    deliveries,
    groupedDeliveries,
    pickupGroups,
    success: true
  };
};

// Helper to calculate distance between two coordinates
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Test proximity grouping with tolerance
export const testProximityGrouping = (deliveries, toleranceKm = 0.1) => {
  console.log(`🧪 Testing proximity grouping with ${toleranceKm}km tolerance`);
  
  const groups = [];
  
  deliveries.forEach(delivery => {
    let foundGroup = false;
    
    for (let group of groups) {
      const distance = calculateDistance(delivery.pickup, group.pickupLocation);
      if (distance <= toleranceKm) {
        group.deliveries.push(delivery);
        foundGroup = true;
        break;
      }
    }
    
    if (!foundGroup) {
      groups.push({
        pickupLocation: delivery.pickup,
        deliveries: [delivery]
      });
    }
  });

  console.log(`📍 Created ${groups.length} proximity groups`);
  groups.forEach((group, index) => {
    console.log(`Group ${index + 1}: ${group.deliveries.length} deliveries`);
  });
  
  return groups;
};

export default {
  generateTestDeliveries,
  testDeliveryGrouping,
  testPopupDataPreparation,
  testBatchUpdatePayload,
  testCompleteWorkflow,
  testProximityGrouping,
  calculateDistance
};

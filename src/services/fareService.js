/**
 * 🚗💰 Frontend Fare Service
 * Client-side integration with the dynamic fare calculation API
 */

import config from '../config';

class FareService {
  constructor() {
    this.apiBaseUrl = config.apiBaseUrl;
  }

  /**
   * 📊 Get quick fare estimate
   * @param {Object} params - Estimation parameters
   * @returns {Promise<Object>} Fare estimate
   */
  async getQuickEstimate(params) {
    try {
      const {
        pickup,        // { lat, lng }
        dropoff,       // { lat, lng }
        type = 'ride',
        packageSize = 'small',
        token
      } = params;

      const url = new URL(`${this.apiBaseUrl}/api/fare/estimate`);
      url.searchParams.append('pickupLat', pickup.lat);
      url.searchParams.append('pickupLng', pickup.lng);
      url.searchParams.append('dropoffLat', dropoff.lat);
      url.searchParams.append('dropoffLng', dropoff.lng);
      url.searchParams.append('type', type);
      url.searchParams.append('packageSize', packageSize);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get fare estimate');
      }

      const data = await response.json();
      return data.estimate;

    } catch (error) {
      console.error('❌ Fare estimate error:', error);
      throw error;
    }
  }

  /**
   * 🎯 Calculate detailed fare with all adjustments
   * @param {Object} params - Calculation parameters
   * @returns {Promise<Object>} Detailed fare breakdown
   */
  async calculateDetailedFare(params) {
    try {
      const {
        pickup,                  // [lng, lat]
        dropoff,                 // [lng, lat]
        type = 'ride',
        packageSize = 'small',
        isMultiDelivery = false,
        routeOptimized = false,
        driverLocation = null,
        token
      } = params;

      const response = await fetch(`${this.apiBaseUrl}/api/fare/calculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup,
          dropoff,
          type,
          packageSize,
          isMultiDelivery,
          routeOptimized,
          driverLocation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate fare');
      }

      const data = await response.json();
      return data.fare;

    } catch (error) {
      console.error('❌ Detailed fare calculation error:', error);
      throw error;
    }
  }

  /**
   * 🚚 Calculate multi-delivery fare
   * @param {Object} params - Multi-delivery parameters
   * @returns {Promise<Object>} Multi-delivery fare breakdown
   */
  async calculateMultiDeliveryFare(params) {
    try {
      const {
        deliveries,              // Array of delivery objects
        driverLocation = null,
        routeOptimized = true,
        token
      } = params;

      const response = await fetch(`${this.apiBaseUrl}/api/fare/multi-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deliveries,
          driverLocation,
          routeOptimized
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate multi-delivery fare');
      }

      const data = await response.json();
      return data.multiDeliveryFare;

    } catch (error) {
      console.error('❌ Multi-delivery fare calculation error:', error);
      throw error;
    }
  }

  /**
   * 📈 Get current surge pricing
   * @param {Object} params - Surge parameters
   * @returns {Promise<Object>} Surge information
   */
  async getSurgePricing(params) {
    try {
      const {
        location,      // { lat, lng }
        type = 'ride',
        token
      } = params;

      const url = new URL(`${this.apiBaseUrl}/api/fare/surge`);
      url.searchParams.append('lat', location.lat);
      url.searchParams.append('lng', location.lng);
      url.searchParams.append('type', type);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get surge pricing');
      }

      const data = await response.json();
      return data.surge;

    } catch (error) {
      console.error('❌ Surge pricing error:', error);
      throw error;
    }
  }

  /**
   * 🎨 Format fare for display
   * @param {number} amount - Fare amount
   * @param {string} currency - Currency code
   * @returns {string} Formatted fare string
   */
  formatFare(amount, currency = 'ZWL') {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'N/A';
    }

    return `${currency} ${amount.toFixed(2)}`;
  }

  /**
   * 🏷️ Get fare breakdown display text
   * @param {Object} fareBreakdown - Detailed fare breakdown
   * @returns {Object} Display-friendly breakdown
   */
  getFareBreakdownDisplay(fareBreakdown) {
    if (!fareBreakdown || !fareBreakdown.breakdown) {
      return null;
    }

    const { breakdown } = fareBreakdown;
    const display = {
      baseFare: this.formatFare(breakdown.base?.total || 0),
      adjustedFare: this.formatFare(fareBreakdown.adjustedFare),
      distance: `${breakdown.base?.distance || 0} km`,
      duration: `${fareBreakdown.metrics?.duration || 0} min`,
      adjustments: [],
      discounts: []
    };

    // Add adjustment descriptions
    if (breakdown.adjustments) {
      const adj = breakdown.adjustments;
      
      if (adj.surge?.multiplier > 1) {
        display.adjustments.push({
          type: 'surge',
          text: adj.surge.description,
          multiplier: `${adj.surge.multiplier}x`
        });
      }

      if (adj.time?.multiplier !== 1) {
        display.adjustments.push({
          type: 'time',
          text: adj.time.description,
          multiplier: `${adj.time.multiplier}x`
        });
      }

      if (adj.weather?.multiplier > 1) {
        display.adjustments.push({
          type: 'weather',
          text: adj.weather.description,
          multiplier: `${adj.weather.multiplier}x`
        });
      }

      if (adj.loyalty?.discount > 0) {
        display.discounts.push({
          type: 'loyalty',
          text: adj.loyalty.description,
          amount: this.formatFare(breakdown.final?.totalDiscounts || 0)
        });
      }
    }

    return display;
  }

  /**
   * 🔄 Calculate fare difference for comparisons
   * @param {number} originalFare - Original fare amount
   * @param {number} newFare - New fare amount
   * @returns {Object} Difference information
   */
  calculateFareDifference(originalFare, newFare) {
    const difference = newFare - originalFare;
    const percentageChange = originalFare > 0 ? (difference / originalFare) * 100 : 0;

    return {
      difference: parseFloat(difference.toFixed(2)),
      percentage: parseFloat(percentageChange.toFixed(1)),
      isIncrease: difference > 0,
      isDecrease: difference < 0,
      formattedDifference: this.formatFare(Math.abs(difference)),
      description: difference > 0 ? 
        `+${this.formatFare(difference)} (${percentageChange.toFixed(1)}% increase)` :
        difference < 0 ?
        `-${this.formatFare(Math.abs(difference))} (${Math.abs(percentageChange).toFixed(1)}% decrease)` :
        'No change'
    };
  }

  /**
   * 📍 Create location object from coordinates
   * @param {Array} coordinates - [lng, lat] array
   * @returns {Object} Location object { lat, lng }
   */
  createLocationFromCoords(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Invalid coordinates format');
    }

    return {
      lng: coordinates[0],
      lat: coordinates[1]
    };
  }

  /**
   * 📍 Create coordinates array from location object
   * @param {Object} location - { lat, lng } object
   * @returns {Array} [lng, lat] array
   */
  createCoordsFromLocation(location) {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new Error('Invalid location format');
    }

    return [location.lng, location.lat];
  }

  /**
   * 💾 Cache fare estimate for reuse
   * @param {string} key - Cache key
   * @param {Object} fareData - Fare data to cache
   * @param {number} ttl - Time to live in seconds (default 5 minutes)
   */
  cacheFareEstimate(key, fareData, ttl = 300) {
    try {
      const cacheData = {
        data: fareData,
        timestamp: Date.now(),
        ttl: ttl * 1000
      };
      
      localStorage.setItem(`fare_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache fare estimate:', error);
    }
  }

  /**
   * 💾 Get cached fare estimate
   * @param {string} key - Cache key
   * @returns {Object|null} Cached fare data or null if expired/not found
   */
  getCachedFareEstimate(key) {
    try {
      const cached = localStorage.getItem(`fare_${key}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheData.timestamp > cacheData.ttl) {
        localStorage.removeItem(`fare_${key}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Failed to get cached fare estimate:', error);
      return null;
    }
  }

  /**
   * 🧮 Generate cache key for fare estimate
   * @param {Object} params - Fare parameters
   * @returns {string} Cache key
   */
  generateCacheKey(params) {
    const { pickup, dropoff, type = 'ride', packageSize = 'small' } = params;
    return `${type}_${pickup.lat}_${pickup.lng}_${dropoff.lat}_${dropoff.lng}_${packageSize}`;
  }
}

// Create singleton instance
const fareService = new FareService();

export default fareService;

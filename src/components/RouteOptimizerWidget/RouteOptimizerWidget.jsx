import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  TrendingUp, 
  Package,
  DollarSign,
  Route,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { calculateOptimizedRoute } from '../../services/deliveryService';
import './RouteOptimizerWidget.css';

const RouteOptimizerWidget = ({ 
  selectedJobs = [], 
  driverLocation = null, 
  userToken,
  onRouteCalculated,
  onOptimizedAccept,
  isVisible = true 
}) => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Calculate route when selected jobs change
  useEffect(() => {
    if (selectedJobs.length >= 2 && userToken) {
      calculateRoute();
    } else {
      setOptimizedRoute(null);
    }
  }, [selectedJobs, driverLocation, userToken]);

  const calculateRoute = async () => {
    if (selectedJobs.length < 2) return;

    setCalculating(true);
    setError(null);

    try {
      const jobIds = selectedJobs.map(job => job.deliveryId);
      const response = await calculateOptimizedRoute(userToken, jobIds, driverLocation);
      
      if (response.success) {
        setOptimizedRoute(response.optimizedRoute);
        if (onRouteCalculated) {
          onRouteCalculated(response.optimizedRoute);
        }
      } else {
        setError(response.message || 'Failed to calculate route');
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err.message || 'Failed to calculate optimized route');
    } finally {
      setCalculating(false);
    }
  };

  // Calculate total savings and benefits
  const routeMetrics = useMemo(() => {
    if (!optimizedRoute || !selectedJobs.length) return null;

    const totalEarnings = selectedJobs.reduce((sum, job) => sum + (parseFloat(job.estimatedEarnings) || 0), 0);
    const totalDistance = optimizedRoute.totalDistance || 0;
    const totalTime = optimizedRoute.totalTime || 0;
    const savings = optimizedRoute.savings || {};

    return {
      totalEarnings,
      totalDistance,
      totalTime,
      distanceSaved: savings.distance || 0,
      timeSaved: savings.time || 0,
      fuelSaved: savings.fuel || 0,
      efficiencyGain: savings.efficiency || 0
    };
  }, [optimizedRoute, selectedJobs]);

  // Group pickups by location
  const pickupGroups = useMemo(() => {
    const groups = {};
    selectedJobs.forEach(job => {
      const locationKey = `${job.pickup.address}-${job.pickup.latitude}-${job.pickup.longitude}`;
      if (!groups[locationKey]) {
        groups[locationKey] = {
          location: job.pickup,
          jobs: []
        };
      }
      groups[locationKey].jobs.push(job);
    });
    return Object.values(groups);
  }, [selectedJobs]);

  const handleOptimizedAccept = () => {
    if (optimizedRoute && onOptimizedAccept) {
      onOptimizedAccept(selectedJobs, optimizedRoute);
    }
  };

  if (!isVisible || selectedJobs.length < 2) {
    return null;
  }

  return (
    <div className="route-optimizer-widget">
      <div className="optimizer-header">
        <div className="header-content">
          <Route size={24} color="var(--color-delivery)" />
          <div className="header-text">
            <h3>Route Optimizer</h3>
            <p>{selectedJobs.length} jobs selected</p>
          </div>
        </div>
        {calculating && (
          <div className="calculating-indicator">
            <div className="spinner"></div>
            <span>Calculating...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Pickup Grouping Preview */}
      <div className="pickup-groups">
        <h4>Pickup Locations ({pickupGroups.length})</h4>
        <div className="groups-list">
          {pickupGroups.map((group, index) => (
            <div key={index} className="pickup-group">
              <div className="group-header">
                <MapPin size={16} color="var(--color-delivery)" />
                <span className="location-name">
                  {group.location.businessName || group.location.address}
                </span>
                <span className="job-count">{group.jobs.length} orders</span>
              </div>
              <div className="group-jobs">
                {group.jobs.map(job => (
                  <div key={job.deliveryId} className="grouped-job">
                    <Package size={12} />
                    <span>#{job.orderId}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Metrics */}
      {routeMetrics && (
        <div className="route-metrics">
          <h4>Route Summary</h4>
          <div className="metrics-grid">
            <div className="metric-item earnings">
              <DollarSign size={16} />
              <div className="metric-content">
                <span className="metric-value">${routeMetrics.totalEarnings.toFixed(2)}</span>
                <span className="metric-label">Total Earnings</span>
              </div>
            </div>

            <div className="metric-item distance">
              <Navigation size={16} />
              <div className="metric-content">
                <span className="metric-value">{routeMetrics.totalDistance.toFixed(1)} km</span>
                <span className="metric-label">Total Distance</span>
              </div>
            </div>

            <div className="metric-item time">
              <Clock size={16} />
              <div className="metric-content">
                <span className="metric-value">{Math.round(routeMetrics.totalTime)} min</span>
                <span className="metric-label">Estimated Time</span>
              </div>
            </div>

            <div className="metric-item efficiency">
              <TrendingUp size={16} />
              <div className="metric-content">
                <span className="metric-value">{routeMetrics.efficiencyGain.toFixed(0)}%</span>
                <span className="metric-label">Efficiency Gain</span>
              </div>
            </div>
          </div>

          {/* Savings Breakdown */}
          {(routeMetrics.distanceSaved > 0 || routeMetrics.timeSaved > 0) && (
            <div className="savings-breakdown">
              <h5>
                <Zap size={14} />
                Optimization Benefits
              </h5>
              <div className="savings-list">
                {routeMetrics.distanceSaved > 0 && (
                  <div className="saving-item">
                    <CheckCircle size={12} color="var(--color-success)" />
                    <span>Save {routeMetrics.distanceSaved.toFixed(1)} km driving</span>
                  </div>
                )}
                {routeMetrics.timeSaved > 0 && (
                  <div className="saving-item">
                    <CheckCircle size={12} color="var(--color-success)" />
                    <span>Save {Math.round(routeMetrics.timeSaved)} minutes</span>
                  </div>
                )}
                {routeMetrics.fuelSaved > 0 && (
                  <div className="saving-item">
                    <CheckCircle size={12} color="var(--color-success)" />
                    <span>Save ${routeMetrics.fuelSaved.toFixed(2)} in fuel</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accept Optimized Route Button */}
      {optimizedRoute && !calculating && (
        <button 
          className="accept-optimized-btn"
          onClick={handleOptimizedAccept}
          disabled={calculating}
        >
          <Route size={16} />
          Accept Optimized Route
          <span className="earnings-preview">
            ${routeMetrics?.totalEarnings.toFixed(2)}
          </span>
        </button>
      )}
    </div>
  );
};

export default RouteOptimizerWidget;

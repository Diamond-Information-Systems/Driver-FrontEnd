import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Star,
  Navigation,
  DollarSign,
  RefreshCw,
  CheckCircle,
  Square,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { 
  getOptimizedJobCombinations, 
  getPickupLocationClusters,
  acceptJobBatch 
} from '../../services/deliveryService';
import RouteOptimizerWidget from '../RouteOptimizerWidget/RouteOptimizerWidget';
import PickupLocationGroup from '../PickupLocationGroup/PickupLocationGroup';
import './DeliveryGroupSelector.css';

const DeliveryGroupSelector = ({ 
  availableJobs = [], 
  userToken, 
  userLocation, 
  onJobsAccepted, 
  onClose 
}) => {
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [pickupClusters, setPickupClusters] = useState([]);
  const [optimizedCombinations, setOptimizedCombinations] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('clusters'); // 'clusters' | 'list' | 'optimizer'

  // Fetch pickup clusters and optimized combinations on mount
  useEffect(() => {
    if (userToken && availableJobs.length > 0) {
      fetchDeliveryIntelligence();
    }
  }, [userToken, availableJobs, userLocation]);

  const fetchDeliveryIntelligence = async () => {
    setLoading(true);
    setError(null);

    try {
      const [clustersResponse, combinationsResponse] = await Promise.all([
        getPickupLocationClusters(
          userToken, 
          userLocation?.latitude, 
          userLocation?.longitude, 
          1.0
        ),
        getOptimizedJobCombinations(
          userToken, 
          userLocation?.latitude, 
          userLocation?.longitude, 
          0.5
        )
      ]);

      if (clustersResponse.success) {
        setPickupClusters(clustersResponse.clusters || []);
      }

      if (combinationsResponse.success) {
        setOptimizedCombinations(combinationsResponse.combinations || []);
      }
    } catch (err) {
      console.error('Error fetching delivery intelligence:', err);
      setError(err.message || 'Failed to load delivery optimization data');
    } finally {
      setLoading(false);
    }
  };

  // Get selected jobs details
  const selectedJobs = useMemo(() => {
    return availableJobs.filter(job => selectedJobIds.includes(job.deliveryId));
  }, [availableJobs, selectedJobIds]);

  // Calculate selection metrics
  const selectionMetrics = useMemo(() => {
    if (selectedJobs.length === 0) return null;

    const totalEarnings = selectedJobs.reduce((sum, job) => sum + (parseFloat(job.estimatedEarnings) || 0), 0);
    const totalDistance = selectedJobs.reduce((sum, job) => sum + (parseFloat(job.estimatedDistance) || 0), 0);
    const uniquePickupLocations = new Set(selectedJobs.map(job => 
      `${job.pickup.latitude},${job.pickup.longitude}`
    )).size;

    return {
      totalEarnings,
      totalDistance,
      uniquePickupLocations,
      averageEarningsPerKm: totalDistance > 0 ? totalEarnings / totalDistance : 0
    };
  }, [selectedJobs]);

  const handleJobSelection = (jobId, isSelected) => {
    setSelectedJobIds(prev => 
      isSelected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  };

  const handleSelectCluster = (cluster) => {
    const clusterJobIds = cluster.jobs.map(job => job.deliveryId);
    setSelectedJobIds(prev => {
      const newSelection = [...prev];
      clusterJobIds.forEach(jobId => {
        if (!newSelection.includes(jobId)) {
          newSelection.push(jobId);
        }
      });
      return newSelection;
    });
  };

  const handleSelectCombination = (combination) => {
    const combinationJobIds = combination.jobs.map(job => job.deliveryId);
    setSelectedJobIds(combinationJobIds);
  };

  const handleAcceptSelected = async () => {
    if (selectedJobs.length === 0) return;

    setAccepting(true);
    setError(null);

    try {
      const response = await acceptJobBatch(userToken, selectedJobIds, optimizedRoute);
      
      if (response.success) {
        if (onJobsAccepted) {
          onJobsAccepted(selectedJobs, response.route);
        }
        if (onClose) {
          onClose();
        }
      } else {
        setError(response.message || 'Failed to accept selected jobs');
      }
    } catch (err) {
      console.error('Error accepting job batch:', err);
      setError(err.message || 'Failed to accept selected jobs');
    } finally {
      setAccepting(false);
    }
  };

  const handleRouteCalculated = (route) => {
    setOptimizedRoute(route);
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return typeof distance === 'string' ? distance : `${distance.toFixed(1)} km`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="delivery-group-selector loading">
        <div className="loading-content">
          <RefreshCw className="spin" size={32} />
          <h3>Analyzing delivery opportunities...</h3>
          <p>Finding optimal routes and combinations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-group-selector">
      {/* Header */}
      <div className="selector-header">
        <div className="header-content">
          <Layers size={24} color="var(--color-delivery)" />
          <div className="header-text">
            <h2>Smart Delivery Selection</h2>
            <p>{availableJobs.length} jobs available • {selectedJobs.length} selected</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="view-mode-selector">
        <button 
          className={`mode-btn ${viewMode === 'clusters' ? 'active' : ''}`}
          onClick={() => setViewMode('clusters')}
        >
          <Target size={16} />
          Pickup Clusters
        </button>
        <button 
          className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <Package size={16} />
          All Jobs
        </button>
        {selectedJobs.length >= 2 && (
          <button 
            className={`mode-btn ${viewMode === 'optimizer' ? 'active' : ''}`}
            onClick={() => setViewMode('optimizer')}
          >
            <Zap size={16} />
            Route Optimizer
          </button>
        )}
      </div>

      {/* Selection Metrics */}
      {selectionMetrics && (
        <div className="selection-metrics">
          <div className="metric">
            <DollarSign size={16} />
            <span>${selectionMetrics.totalEarnings.toFixed(2)}</span>
          </div>
          <div className="metric">
            <MapPin size={16} />
            <span>{selectionMetrics.uniquePickupLocations} locations</span>
          </div>
          <div className="metric">
            <Navigation size={16} />
            <span>{selectionMetrics.totalDistance.toFixed(1)} km</span>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'clusters' && (
        <div className="clusters-view">
          {/* Optimized Combinations */}
          {optimizedCombinations.length > 0 && (
            <div className="combinations-section">
              <h3>
                <Zap size={18} />
                Recommended Combinations
              </h3>
              <div className="combinations-list">
                {optimizedCombinations.slice(0, 3).map((combination, index) => (
                  <div key={index} className="combination-card">
                    <div className="combination-header">
                      <div className="combination-info">
                        <span className="combination-title">
                          {combination.jobs.length} jobs • {combination.pickupLocations} pickup{combination.pickupLocations !== 1 ? 's' : ''}
                        </span>
                        <span className="savings-info">
                          Save {combination.savings.time.toFixed(0)}min, {combination.savings.distance.toFixed(1)}km
                        </span>
                      </div>
                      <button 
                        className="select-combination-btn"
                        onClick={() => handleSelectCombination(combination)}
                      >
                        Select All
                      </button>
                    </div>
                    <div className="combination-jobs">
                      {combination.jobs.map(job => (
                        <div key={job.deliveryId} className="mini-job-card">
                          <Package size={12} />
                          <span>#{job.orderId}</span>
                          <span className="earning">${job.estimatedEarnings}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pickup Clusters */}
          {pickupClusters.length > 0 && (
            <div className="clusters-section">
              <h3>
                <Target size={18} />
                Pickup Clusters
              </h3>
              <div className="clusters-list">
                {pickupClusters.map((cluster, index) => (
                  <div key={index} className="cluster-card">
                    <div className="cluster-header">
                      <div className="cluster-info">
                        <MapPin size={16} color="var(--color-delivery)" />
                        <div className="cluster-details">
                          <span className="cluster-location">
                            {cluster.location.businessName || cluster.location.address}
                          </span>
                          <span className="cluster-stats">
                            {cluster.jobs.length} jobs • {cluster.radius.toFixed(1)}km radius
                          </span>
                        </div>
                      </div>
                      <button 
                        className="select-cluster-btn"
                        onClick={() => handleSelectCluster(cluster)}
                      >
                        Select {cluster.jobs.length}
                      </button>
                    </div>
                    <div className="cluster-jobs">
                      {cluster.jobs.map(job => (
                        <div key={job.deliveryId} className="cluster-job">
                          <div className="job-selection">
                            <button
                              className={`selection-btn ${selectedJobIds.includes(job.deliveryId) ? 'selected' : ''}`}
                              onClick={() => handleJobSelection(job.deliveryId, !selectedJobIds.includes(job.deliveryId))}
                            >
                              {selectedJobIds.includes(job.deliveryId) ? 
                                <CheckCircle size={16} /> : 
                                <Square size={16} />
                              }
                            </button>
                          </div>
                          <div className="job-info">
                            <span className="job-id">#{job.orderId}</span>
                            <span className="job-customer">{job.customer.name}</span>
                            <span className="job-earning">${job.estimatedEarnings}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="jobs-list-view">
          <div className="jobs-grid">
            {availableJobs.map(job => (
              <div key={job.deliveryId} className={`job-card ${selectedJobIds.includes(job.deliveryId) ? 'selected' : ''}`}>
                <div className="job-selection">
                  <button
                    className={`selection-btn ${selectedJobIds.includes(job.deliveryId) ? 'selected' : ''}`}
                    onClick={() => handleJobSelection(job.deliveryId, !selectedJobIds.includes(job.deliveryId))}
                  >
                    {selectedJobIds.includes(job.deliveryId) ? 
                      <CheckCircle size={16} /> : 
                      <Square size={16} />
                    }
                  </button>
                </div>

                <div className="job-content">
                  {/* Job Header */}
                  <div className="job-header">
                    <div className="job-info">
                      <Package size={16} color="var(--color-delivery)" />
                      <span className="order-id">#{job.orderId}</span>
                    </div>
                    <div className="earnings">
                      <DollarSign size={14} />
                      <span>${job.estimatedEarnings}</span>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="customer-info">
                    <User size={14} />
                    <span>{job.customer.name}</span>
                  </div>

                  {/* Route */}
                  <div className="route-preview">
                    <div className="route-stop">
                      <MapPin size={12} />
                      <span>{job.pickup.businessName || job.pickup.address}</span>
                    </div>
                    <div className="route-arrow">→</div>
                    <div className="route-stop">
                      <MapPin size={12} />
                      <span>{job.dropoff.address}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="job-details">
                    <span className="distance">{formatDistance(job.estimatedDistance)}</span>
                    <span className="time">{formatTime(job.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'optimizer' && selectedJobs.length >= 2 && (
        <RouteOptimizerWidget
          selectedJobs={selectedJobs}
          driverLocation={userLocation}
          userToken={userToken}
          onRouteCalculated={handleRouteCalculated}
          isVisible={true}
        />
      )}

      {/* Action Buttons */}
      {selectedJobs.length > 0 && (
        <div className="action-buttons">
          <button 
            className="clear-selection-btn"
            onClick={() => setSelectedJobIds([])}
          >
            Clear Selection
          </button>
          <button 
            className="accept-selected-btn"
            onClick={handleAcceptSelected}
            disabled={accepting}
          >
            {accepting ? (
              <>
                <RefreshCw className="spin" size={16} />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Accept {selectedJobs.length} Job{selectedJobs.length !== 1 ? 's' : ''}
                {selectionMetrics && (
                  <span className="earnings-preview">
                    ${selectionMetrics.totalEarnings.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryGroupSelector;

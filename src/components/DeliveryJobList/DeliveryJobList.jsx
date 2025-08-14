import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Star,
  Navigation,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { getAvailableDeliveryJobs, acceptDeliveryJob } from '../../services/deliveryService';
import './DeliveryJobList.css';

const DeliveryJobList = ({ userToken, userLocation, onJobAccepted }) => {
  const [jobs, setJobs] = useState([]);
  const [suggestedCombinations, setSuggestedCombinations] = useState([]);
  const [hasActiveRoute, setHasActiveRoute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);

  const fetchAvailableJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAvailableDeliveryJobs(
        userToken, 
        userLocation?.lat || userLocation?.latitude, 
        userLocation?.lng || userLocation?.longitude
      );
      
      if (response.success) {
        setJobs(response.jobs || []);
        setSuggestedCombinations(response.suggestedCombinations || []);
        setHasActiveRoute(response.hasActivRoute || false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch available jobs');
      console.error('Error fetching available jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableJobs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAvailableJobs, 30000);
    
    return () => clearInterval(interval);
  }, [userToken, userLocation]);

  const handleAcceptJob = async (deliveryId) => {
    setAccepting(deliveryId);
    
    try {
      const response = await acceptDeliveryJob(deliveryId, userToken);
      
      if (response.success) {
        // Remove the accepted job from the list
        setJobs(prev => prev.filter(job => job.deliveryId !== deliveryId));
        
        // Notify parent component with the full response (including route)
        if (onJobAccepted) {
          onJobAccepted(response);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept job');
      console.error('Error accepting job:', err);
    } finally {
      setAccepting(null);
    }
  };

  const openNavigation = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(url, '_blank');
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

  if (loading && jobs.length === 0) {
    return (
      <div className="delivery-job-list">
        <div className="job-list-header">
          <h3>Available Delivery Jobs</h3>
          <div className="loading-spinner">
            <RefreshCw className="spin" size={20} />
          </div>
        </div>
        <p className="loading-message">Loading available jobs...</p>
      </div>
    );
  }

  return (
    <div className="delivery-job-list">
      <div className="job-list-header">
        <h3>
          {hasActiveRoute ? 'Your Delivery Queue' : 'Available Delivery Jobs'}
        </h3>
        <button 
          className="refresh-btn"
          onClick={fetchAvailableJobs}
          disabled={loading}
          title="Refresh available jobs"
        >
          <RefreshCw className={loading ? 'spin' : ''} size={20} />
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAvailableJobs} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <Package size={48} color="#ccc" />
          <h4>
            {hasActiveRoute ? 'Queue Complete' : 'No Available Jobs'}
          </h4>
          <p>
            {hasActiveRoute 
              ? 'All assigned deliveries completed. Great work!' 
              : 'Check back later for new delivery opportunities'
            }
          </p>
          {hasActiveRoute && (
            <div className="completion-actions">
              <button 
                className="new-opportunities-btn"
                onClick={fetchAvailableJobs}
              >
                <RefreshCw size={16} />
                Look for New Opportunities
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="jobs-container">
          {/* Status Banner */}
          {hasActiveRoute && (
            <div className="status-banner">
              <div className="banner-content">
                <Package size={20} color="var(--color-delivery)" />
                <div className="banner-text">
                  <span className="banner-title">Active Route</span>
                  <span className="banner-subtitle">
                    {jobs.length} delivery{jobs.length !== 1 ? 'ies' : ''} in your queue
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Smart Suggestions Section */}
          {hasActiveRoute && suggestedCombinations.length > 0 && (
            <div className="suggestions-section">
              <h4 className="suggestions-title">
                <Star size={18} color="var(--color-primary)" />
                Smart Route Additions
              </h4>
              <p className="suggestions-subtitle">
                These deliveries optimize your current route
              </p>
              
              {suggestedCombinations.slice(0, 3).map((suggestion) => {
                const job = jobs.find(j => j.deliveryId === suggestion.jobId);
                if (!job) return null;
                
                return (
                  <div key={job.deliveryId} className="job-card suggested">
                    <div className="suggestion-badge">
                      <Star size={12} />
                      <span>+{suggestion.savings.efficiency.toFixed(0)}% efficiency</span>
                    </div>
                    
                    {/* Regular job content but with suggestion styling */}
                    <div className="job-header">
                      <div className="job-info">
                        <div className="order-details">
                          <Package size={20} color="var(--color-primary)" />
                          <span className="order-id">#{job.orderId}</span>
                        </div>
                        <div className="time-posted">
                          <Clock size={14} />
                          <span>{formatTime(job.createdAt)}</span>
                        </div>
                      </div>
                      <div className="earnings suggested-earnings">
                        <DollarSign size={16} />
                        <span>R{job.estimatedEarnings}</span>
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="route-info">
                      <div className="route-stop pickup">
                        <MapPin size={16} color="var(--color-primary)" />
                        <div className="stop-details">
                          <span className="stop-label">Pickup</span>
                          <span className="stop-address">{job.pickup.address}</span>
                        </div>
                      </div>
                      <div className="route-line"></div>
                      <div className="route-stop dropoff">
                        <MapPin size={16} color="var(--color-success)" />
                        <div className="stop-details">
                          <span className="stop-label">Dropoff</span>
                          <span className="stop-address">{job.dropoff.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Savings Info */}
                    <div className="savings-info">
                      <div className="saving-item">
                        <span className="saving-label">Distance saved:</span>
                        <span className="saving-value">{suggestion.savings.distance.toFixed(1)} km</span>
                      </div>
                      <div className="saving-item">
                        <span className="saving-label">Time saved:</span>
                        <span className="saving-value">{suggestion.savings.time.toFixed(0)} min</span>
                      </div>
                    </div>

                    {/* Accept Button */}
                    <button
                      className="accept-job-btn suggested-btn"
                      onClick={() => handleAcceptJob(job.deliveryId)}
                      disabled={accepting === job.deliveryId}
                    >
                      {accepting === job.deliveryId ? (
                        <>
                          <RefreshCw className="spin" size={16} />
                          Adding to Route...
                        </>
                      ) : (
                        <>
                          <Star size={16} />
                          Add to Route
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regular Jobs Section */}
          <div className="jobs-grid">
            {jobs.filter(job => !suggestedCombinations.some(s => s.jobId === job.deliveryId)).map((job, index) => (
              <div key={job.deliveryId} className={`job-card ${hasActiveRoute ? 'queued' : 'available'}`}>
                {/* Queue Position for Active Routes */}
                {hasActiveRoute && (
                  <div className="queue-position">
                    <span className="position-number">{index + 1}</span>
                    <span className="position-label">in queue</span>
                  </div>
                )}

                {/* Job Header */}
                <div className="job-header">
                  <div className="job-info">
                    <div className="order-details">
                      <Package size={20} color="var(--color-delivery)" />
                      <span className="order-id">#{job.orderId}</span>
                    </div>
                    <div className="time-posted">
                      <Clock size={14} />
                      <span>{formatTime(job.createdAt)}</span>
                    </div>
                  </div>
                  <div className="earnings">
                    <DollarSign size={16} />
                    <span>R{job.estimatedEarnings}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="customer-section">
                  <div className="customer-info">
                    <User size={16} />
                    <span className="customer-name">{job.customer.name}</span>
                  </div>
                  <button
                    className="contact-btn"
                    onClick={() => window.open(`tel:${job.customer.phone}`)}
                    title="Call customer"
                  >
                    <Phone size={14} />
                  </button>
                </div>

                {/* Route Info */}
                <div className="route-info">
                  <div className="route-stop pickup">
                    <MapPin size={16} color="var(--color-delivery)" />
                    <div className="stop-details">
                      <span className="stop-label">Pickup</span>
                      <span className="stop-address">{job.pickup.address}</span>
                    </div>
                    <button
                      className="nav-btn"
                      onClick={() => openNavigation(job.pickup.address)}
                      title="Navigate to pickup"
                    >
                      <Navigation size={14} />
                    </button>
                  </div>

                  <div className="route-line"></div>

                  <div className="route-stop dropoff">
                    <MapPin size={16} color="var(--color-success)" />
                    <div className="stop-details">
                      <span className="stop-label">Dropoff</span>
                      <span className="stop-address">{job.dropoff.address}</span>
                    </div>
                    <button
                      className="nav-btn"
                      onClick={() => openNavigation(job.dropoff.address)}
                      title="Navigate to dropoff"
                    >
                      <Navigation size={14} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                {job.product && (
                  <div className="product-info">
                    <Package size={14} />
                    <span>Product: {job.product.name || job.product.description || 'Package'}</span>
                  </div>
                )}

                {/* Job Details */}
                <div className="job-details">
                  {job.estimatedDistance && (
                    <div className="detail-item">
                      <span className="detail-label">Distance</span>
                      <span className="detail-value">{job.estimatedDistance}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Priority</span>
                    <span className={`detail-value priority-${job.urgency}`}>
                      {job.urgency}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {hasActiveRoute ? (
                  <button
                    className="start-job-btn"
                    onClick={() => handleAcceptJob(job.deliveryId)}
                    disabled={accepting === job.deliveryId || index > 0}
                    title={index > 0 ? "Complete current delivery first" : "Start this delivery"}
                  >
                    {accepting === job.deliveryId ? (
                      <>
                        <RefreshCw className="spin" size={16} />
                        Starting...
                      </>
                    ) : index === 0 ? (
                      <>
                        <Package size={16} />
                        Start Delivery
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Queued
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    className="accept-job-btn"
                    onClick={() => handleAcceptJob(job.deliveryId)}
                    disabled={accepting === job.deliveryId}
                  >
                    {accepting === job.deliveryId ? (
                      <>
                        <RefreshCw className="spin" size={16} />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Package size={16} />
                        Accept Job
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryJobList;

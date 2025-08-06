import React, { useState, useCallback } from 'react';
import './TripSummary.css';

const TripSummary = ({ trip, onClose, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate trip duration
  const calculateDuration = useCallback(() => {
    if (!trip.startTime || !trip.endTime) return 'N/A';
    
    const start = new Date(trip.startTime);
    const end = new Date(trip.endTime);
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  }, [trip.startTime, trip.endTime]);

  // Calculate estimated distance (if available)
  const calculateDistance = useCallback(() => {
    if (trip.distance) {
      return `${trip.distance.toFixed(1)} km`;
    }
    return 'N/A';
  }, [trip.distance]);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  // Handle rating submission
  const handleSubmitRating = useCallback(async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRating({
        rideId: trip._id, // Changed from tripId to rideId to match backend
        rating,
        comment: comment.trim()
        // Removed passengerId as backend doesn't need it
      });
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, trip._id, onSubmitRating]);

  // Handle star rating click
  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  return (
    <div className="trip-summary-overlay">
      <div className="trip-summary-container">
        {/* Header */}
        <div className="trip-summary-header">
          <h2>Trip Completed! 🎉</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Trip Details */}
        <div className="trip-details-section">
          <h3>Trip Details</h3>
          
          {/* Route Information */}
          <div className="route-info">
            <div className="location-item">
              <div className="location-icon pickup">🔵</div>
              <div className="location-details">
                <div className="location-label">Pickup</div>
                <div className="location-address">
                  {trip.pickup?.address || 'Pickup Location'}
                </div>
              </div>
            </div>
            
            <div className="route-line"></div>
            
            <div className="location-item">
              <div className="location-icon dropoff">🔴</div>
              <div className="location-details">
                <div className="location-label">Dropoff</div>
                <div className="location-address">
                  {trip.dropoff?.address || 'Dropoff Location'}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Metrics */}
          <div className="trip-metrics">
            <div className="metric-item">
              <div className="metric-icon">⏱️</div>
              <div className="metric-details">
                <div className="metric-label">Duration</div>
                <div className="metric-value">{calculateDuration()}</div>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-icon">📏</div>
              <div className="metric-details">
                <div className="metric-label">Distance</div>
                <div className="metric-value">{calculateDistance()}</div>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-icon">💰</div>
              <div className="metric-details">
                <div className="metric-label">Fare</div>
                <div className="metric-value">{formatCurrency(trip.fare)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Information */}
        {(trip.passenger || trip.rider) && (
          <div className="passenger-section">
            <h3>Passenger</h3>
            <div className="passenger-info">
              <div className="passenger-avatar">
                {(trip.passenger?.profileImage || trip.rider?.profileImage) ? (
                  <img 
                    src={trip.passenger?.profileImage || trip.rider?.profileImage} 
                    alt={trip.passenger?.name || trip.rider?.name}
                    className="passenger-image"
                  />
                ) : (
                  <div className="passenger-initials">
                    {(trip.passenger?.name || trip.rider?.name)?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="passenger-details">
                <div className="passenger-name">
                  {trip.passenger?.name || trip.rider?.name || 'Anonymous'}
                </div>
                <div className="passenger-phone">
                  {trip.passenger?.phone || trip.rider?.phone || 'No phone number'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Section */}
        <div className="rating-section">
          <h3>Rate Your Passenger</h3>
          <p>How was your experience with this passenger?</p>
          
          {/* Star Rating */}
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                disabled={isSubmitting}
              >
                ⭐
              </button>
            ))}
          </div>
          
          {/* Rating Labels */}
          <div className="rating-labels">
            <span className="rating-label">Poor</span>
            <span className="rating-label">Excellent</span>
          </div>

          {/* Comment Section */}
          <div className="comment-section">
            <label htmlFor="passenger-comment">
              Additional Comments (Optional)
            </label>
            <textarea
              id="passenger-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this passenger..."
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="character-count">
              {comment.length}/500
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="submit-rating-btn"
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
          
          <button
            className="skip-rating-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Skip Rating
          </button>
        </div>

        {/* Trip ID Footer */}
        <div className="trip-footer">
          <small>Trip ID: {trip._id}</small>
        </div>
      </div>
    </div>
  );
};

export default TripSummary;

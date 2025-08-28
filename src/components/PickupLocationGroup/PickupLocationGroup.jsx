import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  CheckCircle,
  Square,
  DollarSign,
  Clock,
  User,
  Store
} from 'lucide-react';
import './PickupLocationGroup.css';

const PickupLocationGroup = ({ 
  location, 
  jobs, 
  selectedJobIds,
  onJobSelection,
  onSelectAll,
  onSelectNone 
}) => {
  const [expanded, setExpanded] = useState(true);

  const allSelected = jobs.every(job => selectedJobIds.includes(job.deliveryId));
  const someSelected = jobs.some(job => selectedJobIds.includes(job.deliveryId));
  const totalEarnings = jobs.reduce((sum, job) => sum + (parseFloat(job.estimatedEarnings) || 0), 0);
  const selectedEarnings = jobs
    .filter(job => selectedJobIds.includes(job.deliveryId))
    .reduce((sum, job) => sum + (parseFloat(job.estimatedEarnings) || 0), 0);

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectNone(jobs.map(job => job.deliveryId));
    } else {
      onSelectAll(jobs.map(job => job.deliveryId));
    }
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

  return (
    <div className="pickup-location-group">
      {/* Location Header */}
      <div className="location-header">
        <div className="location-info">
          <div className="location-icon">
            {location.businessName ? <Store size={20} /> : <MapPin size={20} />}
          </div>
          <div className="location-details">
            <h4 className="location-name">
              {location.businessName || 'Pickup Location'}
            </h4>
            <p className="location-address">{location.address}</p>
            <div className="location-stats">
              <span className="job-count">{jobs.length} orders</span>
              <span className="total-earnings">
                <DollarSign size={12} />
                ${totalEarnings.toFixed(2)}
              </span>
              {someSelected && (
                <span className="selected-earnings">
                  (${selectedEarnings.toFixed(2)} selected)
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="location-controls">
          <button
            className={`select-all-btn ${allSelected ? 'all-selected' : someSelected ? 'some-selected' : ''}`}
            onClick={handleToggleAll}
            title={allSelected ? 'Deselect all orders' : 'Select all orders'}
          >
            {allSelected ? <CheckCircle size={16} /> : <Square size={16} />}
            {allSelected ? 'All Selected' : 'Select All'}
          </button>
          
          <button
            className={`expand-btn ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Orders List */}
      {expanded && (
        <div className="orders-list">
          {jobs.map((job, index) => (
            <div 
              key={job.deliveryId} 
              className={`order-item ${selectedJobIds.includes(job.deliveryId) ? 'selected' : ''}`}
            >
              <div className="order-selection">
                <button
                  className={`selection-btn ${selectedJobIds.includes(job.deliveryId) ? 'selected' : ''}`}
                  onClick={() => onJobSelection(job.deliveryId, !selectedJobIds.includes(job.deliveryId))}
                >
                  {selectedJobIds.includes(job.deliveryId) ? 
                    <CheckCircle size={16} /> : 
                    <Square size={16} />
                  }
                </button>
              </div>

              <div className="order-content">
                <div className="order-header">
                  <div className="order-info">
                    <Package size={14} />
                    <span className="order-id">#{job.orderId}</span>
                    <span className="order-sequence">#{index + 1}</span>
                  </div>
                  <div className="order-earnings">
                    <DollarSign size={12} />
                    <span>${job.estimatedEarnings || '0.00'}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="customer-info">
                    <User size={12} />
                    <span>{job.customer.name}</span>
                  </div>
                  
                  <div className="delivery-address">
                    <MapPin size={12} />
                    <span className="delivery-to">
                      {job.dropoff.address || 'Delivery address'}
                    </span>
                  </div>

                  <div className="order-meta">
                    <div className="order-time">
                      <Clock size={12} />
                      <span>{formatTime(job.createdAt)}</span>
                    </div>
                    {job.estimatedDistance && (
                      <div className="order-distance">
                        <span>{job.estimatedDistance}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="order-actions">
                <button 
                  className="view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add view details functionality
                  }}
                  title="View order details"
                >
                  ℹ️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pickup Instructions */}
      {someSelected && expanded && (
        <div className="pickup-instructions">
          <div className="instruction-header">
            <Package size={16} />
            <span>Pickup Instructions</span>
          </div>
          <div className="instruction-content">
            <p>
              <strong>Selected:</strong> {jobs.filter(j => selectedJobIds.includes(j.deliveryId)).length} of {jobs.length} orders
            </p>
            <p>
              <strong>Pickup Location:</strong> {location.businessName || location.address}
            </p>
            {location.businessName && (
              <p>
                <strong>Business:</strong> Present this screen to collect all selected orders
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupLocationGroup;

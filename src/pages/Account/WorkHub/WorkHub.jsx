import React, { useState } from 'react';
import { 
  IoChevronBack, 
  IoChevronForward,
  IoCarSport,
  IoRestaurant,
  IoBusinessOutline,
  IoTime,
  IoTrendingUp,
  IoLocation,
  IoCheckmarkCircle,
  IoAddCircle,
  IoStatsChart,
  IoWallet
} from 'react-icons/io5';
import './WorkHub.css';
import { useNavigate } from 'react-router-dom';

// Delivery Service Detail Component
const DeliveryDetail = ({ service, onBack }) => {
 
  const getServiceContent = (serviceType) => {
    switch(serviceType) {
      case 'direct':
        return {
          title: 'Direct Delivery',
          description: 'Deliver business items and documents directly to customers',
          features: [
            { icon: <IoBusinessOutline />, title: 'Business Documents', desc: 'Legal papers, contracts, and important documents' },
            { icon: <IoTime />, title: 'Same-Day Delivery', desc: 'Fast delivery within business hours' },
            { icon: <IoLocation />, title: 'City-Wide Coverage', desc: 'Deliver anywhere within the metropolitan area' },
            { icon: <IoWallet />, title: 'Premium Rates', desc: 'Higher earnings for business deliveries' }
          ],
          requirements: [
            'Valid driver\'s license',
            'Clean driving record',
            'Professional appearance',
            'Smartphone with GPS'
          ],
          earnings: 'R150 - R300 per delivery'
        };
      
      case 'food':
        return {
          title: 'Food Delivery',
          description: 'Deliver fresh meals from restaurants to hungry customers',
          features: [
            { icon: <IoRestaurant />, title: 'Restaurant Partners', desc: 'Work with top restaurants in your area' },
            { icon: <IoTime />, title: 'Peak Hour Bonuses', desc: 'Extra earnings during lunch and dinner rush' },
            { icon: <IoTrendingUp />, title: 'High Demand', desc: 'Consistent orders throughout the day' },
            { icon: <IoStatsChart />, title: 'Performance Tracking', desc: 'Monitor your ratings and earnings' }
          ],
          requirements: [
            'Insulated delivery bag',
            'Valid driver\'s license',
            'Food safety certification',
            'Customer service skills'
          ],
          earnings: 'R80 - R200 per delivery + tips'
        };
      
      case 'package':
        return {
          title: 'Package Delivery',
          description: 'Deliver packages and goods safely to customers\' doorsteps',
          features: [
            { icon: <IoBusinessOutline />, title: 'E-commerce Partners', desc: 'Deliver for major online retailers' },
            { icon: <IoLocation />, title: 'Route Optimization', desc: 'Smart routing for maximum efficiency' },
            { icon: <IoCheckmarkCircle />, title: 'Proof of Delivery', desc: 'Photo confirmation and digital signatures' },
            { icon: <IoWallet />, title: 'Bulk Bonuses', desc: 'Extra pay for multiple deliveries' }
          ],
          requirements: [
            'Reliable vehicle',
            'Physical fitness',
            'Valid ID document',
            'Smartphone camera'
          ],
          earnings: 'R60 - R180 per package'
        };
      
      default:
        return null;
    }
  };

  const content = getServiceContent(service.type);
  if (!content) return null;
 
  return (
    <div className="workhub-delivery-detail">
      <header className="workhub-detail-header">
        <button className="workhub-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="workhub-detail-header-title">Vaye</h1>
        <div className="workhub-help-placeholder"></div>
      </header>

      <div className="workhub-detail-content">
        <div className="workhub-service-hero">
          <div className="workhub-service-icon-large">
            {service.icon}
          </div>
          <h2>{content.title}</h2>
          <p className="workhub-service-description">{content.description}</p>
          <div className="workhub-earnings-badge">
            <IoWallet size={20} />
            <span>{content.earnings}</span>
          </div>
        </div>

        <div className="workhub-features-section">
          <h3 className="workhub-features-section-title">What you'll do</h3>
          <div className="workhub-features-grid">
            {content.features.map((feature, index) => (
              <div key={index} className="workhub-feature-card">
                <div className="workhub-feature-icon">{feature.icon}</div>
                <div className="workhub-feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workhub-requirements-section">
          <h3 className="workhub-requirements-section-title">Requirements</h3>
          <div className="workhub-requirements-list">
            {content.requirements.map((req, index) => (
              <div key={index} className="workhub-requirement-item">
                <IoCheckmarkCircle className="workhub-check-icon" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="workhub-action-buttons">
          <button className="workhub-apply-btn">
            <IoCheckmarkCircle size={20} />
            Apply Now
          </button>
          <button className="workhub-learn-more-btn">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Work Hub Component
const WorkHub = () => {
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  
  const deliveryServices = [
    {
      id: 'direct',
      type: 'direct',
      title: 'Direct',
      subtitle: 'Deliver business items',
      status: 'approved',
      icon: <IoBusinessOutline size={40} />,
      earnings: 'High rates',
      description: 'Professional document and item delivery'
    },
    {
      id: 'food',
      type: 'food',
      title: 'Food delivery',
      subtitle: 'Deliver food',
      status: 'approved',
      icon: <IoRestaurant size={40} />,
      earnings: 'Tips included',
      description: 'Restaurant to customer food delivery'
    },
    {
      id: 'package',
      type: 'package',
      title: 'Package',
      subtitle: 'Deliver packages and goods',
      status: 'available',
      icon: <IoBusinessOutline size={40} />,
      earnings: 'Bulk bonuses',
      description: 'E-commerce and parcel delivery'
    }
  ];

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleBackToHub = () => {
    setSelectedService(null);
  };

  if (selectedService) {
    return <DeliveryDetail service={selectedService} onBack={handleBackToHub} />;
  }

  return (
    <div className="workhub-container">
      <header className="workhub-header">
        <button className="workhub-back-btn" onClick={() => window.history.back()}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="workhub-header-title">Vaye</h1>
        <button className="workhub-help-btn" onClick={() => navigate('/help')}>Help</button>
      </header>

      <div className="workhub-content">
        <div className="workhub-hero-section">
          <div className="workhub-hero-image">
            <img src="/images/Delivery.png" alt="Delivery illustration" />
          </div>
          <div className="workhub-hero-text">
            <h2>Work Hub</h2>
            <p>Get approved for earning opportunities</p>
          </div>
        </div>

        <div className="workhub-services-section">
          <h3 className="workhub-services-section-title">Delivery</h3>
          <div className="workhub-services-list">
            {deliveryServices.map((service) => (
              <div 
                key={service.id} 
                className="workhub-service-card"
                onClick={() => handleServiceClick(service)}
              >
                <div className="workhub-service-icon">
                  {service.icon}
                </div>
                
                <div className="workhub-service-info">
                  <h4>{service.title}</h4>
                  <p className="workhub-service-subtitle">{service.subtitle}</p>
                  <p className="workhub-service-description">{service.description}</p>
                  
                  <div className="workhub-service-meta">
                    <div className={`workhub-status-badge ${service.status}`}>
                      {service.status === 'approved' ? (
                        <>
                          <IoCheckmarkCircle size={14} />
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <IoAddCircle size={14} />
                          <span>Add</span>
                        </>
                      )}
                    </div>
                    <span className="workhub-earnings-info">{service.earnings}</span>
                  </div>
                </div>

                <div className="workhub-service-arrow">
                  <IoChevronForward size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workhub-stats-section">
          <h3 className="workhub-stats-section-title">Your Performance</h3>
          <div className="workhub-stats-grid">
            <div className="workhub-stat-card">
              <div className="workhub-stat-icon">
                <IoStatsChart />
              </div>
              <div className="workhub-stat-info">
                <span className="workhub-stat-value">4.8</span>
                <span className="workhub-stat-label">Rating</span>
              </div>
            </div>
            
            <div className="workhub-stat-card">
              <div className="workhub-stat-icon">
                <IoTrendingUp />
              </div>
              <div className="workhub-stat-info">
                <span className="workhub-stat-value">127</span>
                <span className="workhub-stat-label">Deliveries</span>
              </div>
            </div>
            
            <div className="workhub-stat-card">
              <div className="workhub-stat-icon">
                <IoWallet />
              </div>
              <div className="workhub-stat-info">
                <span className="workhub-stat-value">R2,340</span>
                <span className="workhub-stat-label">This Week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkHub;
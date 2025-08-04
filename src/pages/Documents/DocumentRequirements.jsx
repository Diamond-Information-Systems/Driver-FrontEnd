import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DocumentRequirements.css';

// Mock data for document requirements
const mockDriverRequirements = [
  {
    id: 'driving-evaluation',
    title: 'Driving Evaluation Report',
    status: 'needs_attention',
    statusText: 'Needs your attention',
    hasChevron: true
  },
  {
    id: 'terms-conditions',
    title: 'Terms and Conditions',
    status: 'completed',
    statusText: 'Completed',
    hasChevron: false
  },
  {
    id: 'prdp-card',
    title: 'PrDP Card',
    status: 'completed',
    statusText: 'Completed',
    hasChevron: true
  },
  {
    id: 'background-check',
    title: 'Background Check Result Document/Safety Screening Results',
    status: 'completed',
    statusText: 'Completed',
    hasChevron: true
  },
  {
    id: 'profile-photo',
    title: 'Profile photo',
    status: 'completed',
    statusText: 'Completed',
    hasChevron: false
  }
];

const mockVehicleRequirements = [
  {
    id: 'vehicle-1',
    vehicleInfo: 'VW Polo KT49XPGP',
    documents: [
      {
        id: 'insurance-policy-1',
        title: 'Vehicle Insurance Policy',
        status: 'completed',
        statusText: 'Completed',
        hasChevron: true
      },
      {
        id: 'operating-license-1',
        title: 'Meter Taxi Operating License (or Application Receipt)',
        status: 'completed',
        statusText: 'Completed',
        hasChevron: true
      },
      {
        id: 'operator-card-1',
        title: 'Operator Card (Double Disc) or License Disk',
        status: 'completed',
        statusText: 'Completed',
        hasChevron: true
      },
      {
        id: 'inspection-report-1',
        title: 'Vaye Vehicle Inspection Report',
        status: 'completed',
        statusText: 'Completed',
        hasChevron: true
      }
    ]
  },
  {
    id: 'vehicle-2',
    vehicleInfo: 'VW Polo KM33PWGP',
    documents: [
      {
        id: 'insurance-policy-2',
        title: 'Vehicle Insurance Policy',
        status: 'in_review',
        statusText: 'In review',
        hasChevron: true
      },
      {
        id: 'operating-license-2',
        title: 'Meter Taxi Operating License (or Application Receipt)',
        status: 'in_review',
        statusText: 'In review',
        hasChevron: true
      }
    ]
  }
];

const DocumentRequirements = () => {
  const navigate = useNavigate();

  const handleBackPress = () => {
    navigate(-1);
  };

  const handleDocumentPress = (documentId, documentTitle) => {
    // Navigate to document detail page
    navigate(`/document-detail/${documentId}`, { 
      state: { 
        documentTitle,
        documentId 
      } 
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'vaye-doc-status-completed';
      case 'needs_attention':
        return 'vaye-doc-status-attention';
      case 'in_review':
        return 'vaye-doc-status-review';
      default:
        return 'vaye-doc-status-default';
    }
  };

  const renderDriverRequirement = (item) => (
    <div 
      key={item.id}
      className={`vaye-doc-item-unique ${item.hasChevron ? 'clickable' : ''}`}
      onClick={item.hasChevron ? () => handleDocumentPress(item.id, item.title) : undefined}
    >
      <div className="vaye-doc-content-unique">
        <h3 className="vaye-doc-title-unique">{item.title}</h3>
        <p className={`vaye-doc-status-unique ${getStatusClass(item.status)}`}>
          {item.statusText}
        </p>
      </div>
      {item.hasChevron && (
        <div className="vaye-doc-chevron-unique">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );

  const renderVehicleRequirement = (vehicle) => (
    <div key={vehicle.id} className="vaye-vehicle-section-unique">
      <h2 className="vaye-vehicle-title-unique">{vehicle.vehicleInfo}</h2>
      {vehicle.documents.map(doc => (
        <div 
          key={doc.id}
          className={`vaye-doc-item-unique ${doc.hasChevron ? 'clickable' : ''}`}
          onClick={doc.hasChevron ? () => handleDocumentPress(doc.id, doc.title) : undefined}
        >
          <div className="vaye-doc-content-unique">
            <h3 className="vaye-doc-title-unique">{doc.title}</h3>
            <p className={`vaye-doc-status-unique ${getStatusClass(doc.status)}`}>
              {doc.statusText}
            </p>
          </div>
          {doc.hasChevron && (
            <div className="vaye-doc-chevron-unique">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="vaye-doc-requirements-page-unique">
      {/* Header */}
      <header className="vaye-doc-header-unique">
        <button 
          className="vaye-doc-back-btn-unique" 
          onClick={handleBackPress}
          type="button"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="vaye-doc-header-title-unique">Vaye</h1>
        
        <button className="vaye-doc-help-btn-unique">
          Help
        </button>
      </header>

      {/* Content */}
      <main className="vaye-doc-content-unique">
        {/* Driver Requirements Section */}
        <section className="vaye-driver-section-unique">
          <h2 className="vaye-section-title-unique">Driver requirements</h2>
          <div className="vaye-doc-list-unique">
            {mockDriverRequirements.map(renderDriverRequirement)}
          </div>
        </section>

        {/* Vehicle Requirements Section */}
        <section className="vaye-vehicle-requirements-unique">
          {mockVehicleRequirements.map(renderVehicleRequirement)}
        </section>
      </main>
    </div>
  );
};

export default DocumentRequirements;
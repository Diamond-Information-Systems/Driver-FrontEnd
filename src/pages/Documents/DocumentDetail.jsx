import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './DocumentRequirements.css';

// Document-specific content and instructions
const documentContent = {
  'driving-evaluation': {
    title: 'Take a photo of your Driving Evaluation Report',
    description: 'To drive with Vaye in Gauteng, Cape Town or Durban, you must pass a driving evaluation.',
    instructions: [
      'You are encouraged to only submit driver evaluations from our approved service providers, or your application will be rejected.',
      'You can click here to book a driver evaluation near you'
    ],
    hasExampleImage: true,
    exampleImageAlt: 'Example driving evaluation certificates'
  },
  'prdp-card': {
    title: 'Take a photo of your PrDP Card',
    description: 'To transport passengers on South Africa\'s public roads for an income, you must have a Professional Drivers Permit (PrDP).',
    instructions: [
      'Please note that only original PrDP cards will be accepted. Temporary PrDPs will no longer be valid.'
    ],
    tips: 'Tips for taking great photos',
    hasExampleImage: true,
    exampleImageAlt: 'Example PrDP card'
  },
  'background-check': {
    title: 'Take a photo of your Background Check Result Document/Safety Screening Results',
    description: 'To drive with Vaye, you need to complete a background check to ensure a safe experience for riders and drivers. To complete the background check, you can:',
    instructions: [
      'Visit an Vaye-approved background check service provider',
      'Get Your Screening Certificate: This must confirm that you have no criminal record.'
    ],
    hasExampleImage: true,
    exampleImageAlt: 'Example background check document'
  },
  'insurance-policy-1': {
    title: 'Take a photo of your Vehicle Insurance Policy',
    description: 'Please upload your document according to the guidelines below',
    requirements: [
      'Policy Number, License Plate, Vehicle Year, Start Date & Expiration date'
    ],
    warnings: [
      'Upload all pages that include the data above',
      'Make sure that your document is not expired & you upload a clear picture'
    ],
    hasExampleImage: true,
    exampleImageAlt: 'Example vehicle insurance policy document'
  },
  'operating-license-1': {
    title: 'Take a photo of your Meter Taxi Operating License (or Application Receipt)',
    description: 'PLEASE DO NOT UPLOAD IRRELEVANT IMAGES (BLANK PHOTOS, SELFIES, OTHER DOCUMENTS) - THIS WILL DELAY YOUR ACTIVATION',
    instructions: [
      'For metered taxi permits we accept 4 types of documents',
      'Metered Taxi Operating License - Full Document upload as PDF',
      'Receipt from Department of Transport',
      'Status Report from Department of Transport',
      'Please ensure that all information on your document is clear & readable.',
      'This is important to check when uploading the Operating License as the red tag can cause a glare on the information.'
    ],
    hasExampleImage: true,
    exampleImageAlt: 'Example meter taxi operating license'
  },
  'operator-card-1': {
    title: 'Take a photo of your Operator Card (Double Disc) or License Disk',
    description: 'Vehicle inspections are performed at your nearest DEKRA test centre - Johannesburg, Pretoria, Cape Town and Durban only.',
    instructions: [
      'For any e-hailing related inspection queries, you can email e-hailing@dekraauto.co.za',
      'You can click to find your nearest Dekra test centre'
    ],
    hasExampleImage: true,
    exampleImageAlt: 'Example operator card documents'
  },
  'inspection-report-1': {
    title: 'Take a photo of your Vaye Vehicle Inspection Report',
    description: 'How to obtain this document Vehicle inspections are performed by your nearest DEKRA test centre (Johannesburg, Pretoria, Cape Town and Durban) The Inspection report must be uploaded within one month of completing your inspection.',
    hasExampleImage: true,
    exampleImageAlt: 'Example vehicle inspection report'
  }
};

const DocumentDetail = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const documentInfo = documentContent[documentId] || {
    title: 'Document Upload',
    description: 'Please take a photo or upload your document.'
  };

  const handleBackPress = () => {
    navigate(-1);
  };

  const handleTakePhoto = () => {
    // For mobile devices, this will open camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setIsUploading(false);
        
        // Here you would typically upload to your backend
        console.log('File selected:', file.name);
        
        // Simulate upload delay
        setTimeout(() => {
          // Navigate back or show success
          navigate(-1);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocument = () => {
    // Open file picker for documents
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = handleFileSelect;
    input.click();
  };

  return (
    <div className="vaye-doc-detail-page-unique">
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
      <main className="vaye-doc-detail-content-unique">
        <div className="vaye-doc-detail-container-unique">
          {/* Title */}
          <h2 className="vaye-doc-detail-title-unique">{documentInfo.title}</h2>

          {/* Example Image Placeholder */}
          {documentInfo.hasExampleImage && (
            <div className="vaye-doc-example-image-unique">
              <img 
                src="" 
                alt={documentInfo.exampleImageAlt}
                className="vaye-doc-example-img-unique"
                style={{ display: 'none' }} // Hide until you add actual images
              />
              <div className="vaye-doc-image-placeholder-unique">
                <p>Example Document Image</p>
                <span>{documentInfo.exampleImageAlt}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="vaye-doc-description-unique">
            <p>{documentInfo.description}</p>
          </div>

          {/* Instructions */}
          {documentInfo.instructions && (
            <div className="vaye-doc-instructions-unique">
              {documentInfo.instructions.map((instruction, index) => (
                <p key={index} className="vaye-doc-instruction-item-unique">
                  {instruction}
                </p>
              ))}
            </div>
          )}

          {/* Requirements */}
          {documentInfo.requirements && (
            <div className="vaye-doc-requirements-unique">
              <p className="vaye-doc-requirements-title-unique">Your document must include this data:</p>
              <ul className="vaye-doc-requirements-list-unique">
                {documentInfo.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {documentInfo.warnings && (
            <div className="vaye-doc-warnings-unique">
              {documentInfo.warnings.map((warning, index) => (
                <p key={index} className="vaye-doc-warning-item-unique">
                  {warning}
                </p>
              ))}
            </div>
          )}

          {/* Tips */}
          {documentInfo.tips && (
            <div className="vaye-doc-tips-unique">
              <button className="vaye-doc-tips-btn-unique">
                {documentInfo.tips}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="vaye-doc-preview-unique">
              <img src={capturedImage} alt="Captured document" className="vaye-doc-preview-img-unique" />
              <p className="vaye-doc-preview-text-unique">Document captured successfully!</p>
            </div>
          )}

          {/* Loading State */}
          {isUploading && (
            <div className="vaye-doc-loading-unique">
              <div className="vaye-doc-spinner-unique"></div>
              <p>Processing your document...</p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="vaye-doc-actions-unique">
        <button 
          className="vaye-doc-upload-btn-unique"
          onClick={handleUploadDocument}
          disabled={isUploading}
        >
          Upload document
        </button>
        
        <button 
          className="vaye-doc-camera-btn-unique"
          onClick={handleTakePhoto}
          disabled={isUploading}
        >
          Take photo
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default DocumentDetail;
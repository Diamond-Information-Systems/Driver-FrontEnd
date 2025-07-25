import React, { useState } from 'react';
import {
  IoChevronBack,
  IoCheckmarkCircle,
  IoDocument,
  IoBusinessOutline,
} from 'react-icons/io5';
import './TaxManagement.css';

const TaxSettings = ({ onBack }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    streetAddress: '',
    townCity: '',
    postcode: '1234',
    smallBusinessRegime: true,
    disclaimer: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Tax settings saved:', formData);
  };

  return (
    <div className="vaye-tax-page">
      <header className="vaye-tax-header">
        <button className="vaye-tax-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-tax-title">Tax profile</h1>
        <div style={{ width: '48px' }}></div>
      </header>

      <div className="vaye-tax-content">
        <h2 className="vaye-tax-page-title">Invoice Settings</h2>

        <form onSubmit={handleSubmit} className="vaye-tax-form">
          <div className="vaye-tax-form-group">
            <label className="vaye-tax-form-label required">
              Company / Legal Name
            </label>
            <input
              type="text"
              className="vaye-tax-form-input"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter your company or legal name"
              required
            />
          </div>

          <div className="vaye-tax-form-group">
            <label className="vaye-tax-form-label required">
              Street address
            </label>
            <input
              type="text"
              className="vaye-tax-form-input"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              placeholder="Enter your street address"
              required
            />
          </div>

          <div className="vaye-tax-form-group">
            <label className="vaye-tax-form-label required">
              Town/City
            </label>
            <input
              type="text"
              className="vaye-tax-form-input"
              value={formData.townCity}
              onChange={(e) => handleInputChange('townCity', e.target.value)}
              placeholder="Enter your town or city"
              required
            />
          </div>

          <div className="vaye-tax-form-group">
            <label className="vaye-tax-form-label">
              Postcode
            </label>
            <input
              type="text"
              className="vaye-tax-form-input"
              value={formData.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              placeholder="e.g. 1234"
            />
            <small style={{ 
              fontSize: '12px', 
              color: 'var(--vaye-text-muted)', 
              marginTop: '4px', 
              display: 'block' 
            }}>
              e.g. 1234
            </small>
          </div>

          <div className="vaye-tax-checkbox-group">
            <div 
              className={`vaye-tax-checkbox ${formData.smallBusinessRegime ? 'checked' : ''}`}
              onClick={() => handleInputChange('smallBusinessRegime', !formData.smallBusinessRegime)}
            >
              {formData.smallBusinessRegime && <IoCheckmarkCircle size={16} />}
            </div>
            <div>
              <label className="vaye-tax-checkbox-label">
                <strong>Small Business Regime</strong>
              </label>
              <p className="vaye-tax-checkbox-label" style={{ marginTop: '8px' }}>
                In your country a "small business regime" or "VAT registration threshold" 
                may apply. We kindly ask you to indicate if you applied for such a regime 
                with your local tax authorities.
              </p>
            </div>
          </div>

          <div className="vaye-tax-checkbox-group">
            <div 
              className={`vaye-tax-checkbox ${formData.disclaimer ? 'checked' : ''}`}
              onClick={() => handleInputChange('disclaimer', !formData.disclaimer)}
            >
              {formData.disclaimer && <IoCheckmarkCircle size={16} />}
            </div>
            <div>
              <label className="vaye-tax-checkbox-label">
                <strong>Disclaimer</strong>
              </label>
              <div className="vaye-tax-checkbox-label" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '12px' }}>
                  1. I confirm that the information I have provided to Vaye regarding my 
                  business' tax situation is correct. By providing this information I 
                  expressly consent for Vaye, where required, to issue tax compliant 
                  invoices on behalf of my business for services provided by my business 
                  through the Vaye platform.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  2. I understand and accept that by providing a VAT number, Vaye will 
                  automatically treat my business as a VAT registered business.
                </p>
                <p>
                  3. I understand and accept that Vaye accepts no liability for incorrect 
                  information provided by me, including but not limited to information in 
                  relation to:
                </p>
                <ul style={{ 
                  marginTop: '8px', 
                  marginLeft: '20px',
                  listStyle: 'disc',
                  color: 'var(--vaye-text-muted)'
                }}>
                  <li>my VAT identification number and;</li>
                  <li>whether or not a small business regime applies.</li>
                </ul>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="vaye-tax-button"
            disabled={!formData.disclaimer}
            style={{
              opacity: formData.disclaimer ? 1 : 0.5,
              cursor: formData.disclaimer ? 'pointer' : 'not-allowed'
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaxSettings;
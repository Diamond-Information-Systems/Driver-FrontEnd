import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Address.css';

const AddressForm = ({ onSave, initialData = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address1: initialData.address1 || '',
    address2: initialData.address2 || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postcode: initialData.postcode || ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field if it has a value
    if (value.trim() && errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = ['address1', 'city', 'state', 'postcode'];
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Call the onSave prop with form data
      if (onSave) {
        await onSave(formData);
      }
      
      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        // Optionally navigate back after successful save
        // navigate(-1);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving address:', error);
      // Handle error state here if needed
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submit (Enter key)
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  // Check if all required fields are filled
  const isFormValid = formData.address1.trim() && 
                      formData.city.trim() && 
                      formData.state.trim() && 
                      formData.postcode.trim();

  // Auto-scroll input into view on mobile
  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }, 300);
  };

  return (
    <div className="vaye-address-page-unique">
      {/* Header */}
      <header className="vaye-address-header-unique">
        <button 
          className="vaye-back-btn-unique" 
          onClick={handleGoBack}
          type="button"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          className={`vaye-save-btn-unique ${saveSuccess ? 'success' : ''}`}
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
          type="button"
        >
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
        </button>
      </header>

      {/* Content */}
      <main className="vaye-address-content-unique">
        <form className="vaye-address-form-unique" onSubmit={handleSubmit}>
          {/* Address 1 */}
          <div className="vaye-form-group-unique">
            <label className="vaye-form-label-unique" htmlFor="address1-unique">
              Address 1
            </label>
            <input 
              type="text" 
              id="address1-unique"
              name="address1"
              className={`vaye-form-input-unique ${errors.address1 ? 'error' : ''}`}
              placeholder="Enter your street address"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              onFocus={handleInputFocus}
              required
            />
          </div>

          {/* Address 2 */}
          <div className="vaye-form-group-unique">
            <label className="vaye-form-label-unique" htmlFor="address2-unique">
              Address 2
            </label>
            <input 
              type="text" 
              id="address2-unique"
              name="address2"
              className="vaye-form-input-unique"
              placeholder="Apartment, suite, etc. (optional)"
              value={formData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              onFocus={handleInputFocus}
            />
          </div>

          {/* City */}
          <div className="vaye-form-group-unique">
            <label className="vaye-form-label-unique" htmlFor="city-unique">
              City
            </label>
            <input 
              type="text" 
              id="city-unique"
              name="city"
              className={`vaye-form-input-unique ${errors.city ? 'error' : ''}`}
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onFocus={handleInputFocus}
              required
            />
          </div>

          {/* State and Postcode Row */}
          <div className="vaye-form-group-unique vaye-form-row-unique">
            <div className="vaye-form-field-unique">
              <label className="vaye-form-label-unique" htmlFor="state-unique">
                State
              </label>
              <input 
                type="text" 
                id="state-unique"
                name="state"
                className={`vaye-form-input-unique ${errors.state ? 'error' : ''}`}
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                onFocus={handleInputFocus}
                required
              />
            </div>
            <div className="vaye-form-field-unique">
              <label className="vaye-form-label-unique" htmlFor="postcode-unique">
                Postcode
              </label>
              <input 
                type="text" 
                id="postcode-unique"
                name="postcode"
                className={`vaye-form-input-unique ${errors.postcode ? 'error' : ''}`}
                placeholder="Postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value)}
                onFocus={handleInputFocus}
                required
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddressForm;
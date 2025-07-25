import React, { useState } from 'react';
import {
  IoChevronBack,
  IoChevronForward,
} from 'react-icons/io5';
import './TaxManagement.css';
import TaxSettings from './TaxSettings';
import TaxInvoices from './TaxInvoices';
import TaxSummaries from './TaxSummaries';

const TaxInformation = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState('main');

  const menuItems = [
    {
      id: 'settings',
      title: 'Tax settings',
      description: 'Keep your tax information up to date.',
      page: 'settings'
    },
    {
      id: 'invoices',
      title: 'Tax invoices',
      description: 'View or download invoices.',
      page: 'invoices'
    },
    {
      id: 'summaries',
      title: 'Tax summaries',
      description: 'Track your earnings, expenses and net payout.',
      page: 'summaries'
    }
  ];

  const handleMenuClick = (pageId) => {
    setCurrentPage(pageId);
  };

  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  // Render different pages based on current state
  switch (currentPage) {
    case 'settings':
      return <TaxSettings onBack={handleBackToMain} />;
    case 'invoices':
      return <TaxInvoices onBack={handleBackToMain} />;
    case 'summaries':
      return <TaxSummaries onBack={handleBackToMain} />;
    default:
      return (
        <div className="vaye-tax-page">
          <header className="vaye-tax-header dark">
            <button className="vaye-tax-back-btn" onClick={onBack}>
              <IoChevronBack size={24} />
            </button>
            <h1 className="vaye-tax-title">Tax information</h1>
            <div style={{ width: '48px' }}></div>
          </header>

          <div className="vaye-tax-content">
            <div className="vaye-invoice-list">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className="vaye-tax-menu-item"
                  onClick={() => handleMenuClick(item.page)}
                >
                  <div className="vaye-tax-menu-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <IoChevronForward className="vaye-tax-chevron" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }
};

export default TaxInformation;
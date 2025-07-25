import React, { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import "./Email.css";

const Email = () => {
  const [subscribed, setSubscribed] = useState(true);
  const [categories, setCategories] = useState({
    earningOpportunities: true,
    recognitionMilestones: true,
    productUpdates: true,
    feedback: true,
  });

  const handleBack = () => {
    window.history.back();
  };

  const toggleCategory = (categoryKey) => {
    setCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }));
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-slider"></div>
    </div>
  );

  const CheckBox = ({ checked, onToggle }) => (
    <div className={`checkbox ${checked ? "checked" : ""}`} onClick={onToggle}>
      {checked && <Check size={16} color="white" strokeWidth={3} />}
    </div>
  );

  const notificationCategories = [
    {
      key: "earningOpportunities",
      title: "Earning opportunities",
      description:
        "Demand info, promotions from Uber and additional ways to make money",
    },
    {
      key: "recognitionMilestones",
      title: "Recognition and milestones",
      description:
        "Recognition for your achievements and Uber Pro rewards programme to earn points",
    },
    {
      key: "productUpdates",
      title: "Product updates and news",
      description: "New product updates and interesting news",
    },
    {
      key: "feedback",
      title: "Feedback",
      description: "User research and marketing surveys",
    },
  ];

  return (
    <div className="email-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Email</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Subscribed Section */}
        <div className="subscription-section">
          <div className="subscription-item">
            <span className="subscription-label">Subscribed</span>
            <ToggleSwitch
              isOn={subscribed}
              onToggle={() => setSubscribed(!subscribed)}
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="section">
          <div className="section-title">Categories</div>

          <div className="categories-container">
            {notificationCategories.map((category) => (
              <div
                key={category.key}
                className="category-item"
              
              >
                <div className="category-content">
                  <div className="category-title">{category.title}</div>
                  <div className="category-description">
                    {category.description}
                  </div>
                </div>
                <CheckBox
                  checked={categories[category.key]}
                  onToggle={() => toggleCategory(category.key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Email;

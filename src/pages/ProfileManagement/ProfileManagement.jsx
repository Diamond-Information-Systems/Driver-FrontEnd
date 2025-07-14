import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Globe,
  Home,
  Clock,
  Star,
  Trophy,
  ThumbsUp,
  MapPin,
  MessageCircle,
  Plus,
  Camera,
  Shield,
  Award,
  Calendar,
  Users,
  Save,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProfileManagement.css";

const ProfileManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Background images array
  const backgroundImages = [
    "/images/road.jpg",
    "/images/scene.jpg",
    "/images/trees.jpg",
    "/images/zebra.jpg",
    "/images/flag.jpg",
    "/images/cow.jpg",
    "/images/bird.jpg",
  ];

  // State management
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showFunFactModal, setShowFunFactModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: user?.user?.name || "Nhlamulo",
    languages: user?.user?.languages || ["English", "Xitsonga"],
    location: user?.user?.location || "Pretoria South Africa",
    funFact: user?.user?.funFact || "",
    otherExperience: user?.user?.otherExperience || "",
  });

  const [tempFunFact, setTempFunFact] = useState("");
  const [tempExperience, setTempExperience] = useState("");

  // Get background image on component mount and when user returns
  useEffect(() => {
    const getNextBackground = () => {
      const lastIndex = parseInt(localStorage.getItem("lastBgIndex") || "0");
      let nextIndex;

      // If it's the same session, just increment
      if (sessionStorage.getItem("profileVisited")) {
        nextIndex = (lastIndex + 1) % backgroundImages.length;
      } else {
        // First visit this session, randomize
        nextIndex = Math.floor(Math.random() * backgroundImages.length);
        sessionStorage.setItem("profileVisited", "true");
      }

      localStorage.setItem("lastBgIndex", nextIndex.toString());
      setCurrentBgIndex(nextIndex);
    };

    getNextBackground();
  }, []);

  // Sample data - replace with actual user data
  const driverData = {
    profileImage: user?.user?.profileImage || null,
    experience: "3,605 trips over 1.5 years",
    rating: 4.9,
    memberSince: "2022",
  };

  const compliments = [
    { name: "Excellent Service", count: 5, icon: Trophy, color: "#FFD700" },
    { name: "Great Chat", count: 3, icon: MessageCircle, color: "#4CAF50" },
    { name: "Great Route Choice", count: 3, icon: MapPin, color: "#2196F3" },
    { name: "Clean and Safe", count: 2, icon: Shield, color: "#9C27B0" },
    { name: "Punctual", count: 8, icon: Clock, color: "#FF6B35" },
    { name: "Friendly", count: 12, icon: ThumbsUp, color: "#4ECDC4" },
    { name: "Professional", count: 6, icon: Award, color: "#45B7D1" },
    { name: "Helpful", count: 4, icon: Users, color: "#96CEB4" },
  ];

  const achievements = [
    { name: "1500 5-star trips", icon: Star, color: "#FFD700" },
    { name: "1 Year with Vaye", icon: Calendar, color: "#FF6B6B" },
    { name: "Top Rated Driver", icon: Award, color: "#4ECDC4" },
    { name: "Community Favorite", icon: Users, color: "#45B7D1" },
  ];

  const handleBackClick = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing && hasChanges) {
      // Auto-save when exiting edit mode
      handleSave();
    }
  };

  const handleSave = async () => {
    try {
      // Here you would typically make an API call to save the data
      console.log("Saving profile data:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setHasChanges(false);
      setIsEditing(false);

      // Show success feedback
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleAddFunFact = () => {
    setTempFunFact(formData.funFact);
    setShowFunFactModal(true);
  };

  const handleSaveFunFact = () => {
    handleInputChange("funFact", tempFunFact);
    setShowFunFactModal(false);
  };

  const handleAddExperience = () => {
    setTempExperience(formData.otherExperience);
    setShowExperienceModal(true);
  };

  const handleSaveExperience = () => {
    handleInputChange("otherExperience", tempExperience);
    setShowExperienceModal(false);
  };

  const handleViewAllCompliments = () => {
    setShowViewAllModal(true);
  };

  return (
    <div className="profile-management">
      {/* Header Section with Background Image */}
      <div
        className="profile-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url(${backgroundImages[currentBgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Navigation */}
        <div className="profile-nav">
          <button className="back-btn" onClick={handleBackClick}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="profile-nav-title">Profile</h1>
          <div className="nav-actions">
            {hasChanges && (
              <button className="save-btn" onClick={handleSave}>
                <Save size={20} />
              </button>
            )}
            <button className="edit-btn" onClick={handleEditToggle}>
              {isEditing ? <Check size={24} /> : <Edit size={24} />}
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-hero-content">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {driverData.profileImage ? (
                <img src={driverData.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="profile-name-input"
              placeholder="Enter your name"
            />
          ) : (
            <h2 className="profile-name">{formData.name}</h2>
          )}

          <button className="learn-about-btn">Learn about Vaye Pro</button>
        </div>
      </div>

      {/* Content Section */}
      <div className="profile-content">
        {/* Basic Info */}
        <div className="info-section">
          <div className="info-item">
            <Globe size={20} />
            {isEditing ? (
              <input
                type="text"
                value={formData.languages.join(", ")}
                onChange={(e) =>
                  handleInputChange("languages", e.target.value.split(", "))
                }
                className="info-input"
                placeholder="Languages (separate with commas)"
              />
            ) : (
              <span>Knows {formData.languages.join(" and ")}</span>
            )}
          </div>
          <div className="info-item">
            <Home size={20} />
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="info-input"
                placeholder="Your location"
              />
            ) : (
              <span>From {formData.location}</span>
            )}
          </div>
          <div className="info-item">
            <Clock size={20} />
            <span>{driverData.experience}</span>
          </div>
          {formData.funFact && (
            <div className="info-item">
              <Star size={20} />
              <span>{formData.funFact}</span>
            </div>
          )}
          {formData.otherExperience && (
            <div className="info-item">
              <Users size={20} />
              <span>{formData.otherExperience}</span>
            </div>
          )}
        </div>

        {/* Compliments Section */}
        <div className="section">
          <div className="section-header">
            <h3>Compliments</h3>
            <button className="view-all-btn" onClick={handleViewAllCompliments}>
              View all
            </button>
          </div>
          <div className="compliments-grid">
            {compliments.slice(0, 4).map((compliment, index) => {
              const IconComponent = compliment.icon;
              return (
                <div key={index} className="compliment-card">
                  <div
                    className="compliment-icon"
                    style={{ backgroundColor: compliment.color }}
                  >
                    <IconComponent size={24} />
                    <span className="compliment-count">{compliment.count}</span>
                  </div>
                  <span className="compliment-name">{compliment.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="section">
          <h3>Achievements</h3>
          <div className="achievements-grid">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="achievement-card">
                  <div
                    className="achievement-icon"
                    style={{ backgroundColor: achievement.color }}
                  >
                    <IconComponent size={32} />
                  </div>
                  <span className="achievement-name">{achievement.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share Your Story Section */}
        <div className="section">
          <h3>Share your story</h3>
          <div className="story-cards">
            <div className="story-card" onClick={handleAddFunFact}>
              <div className="story-content">
                <h4>Fun fact</h4>
                <p>
                  {formData.funFact ||
                    "What's something that makes you unique?"}
                </p>
              </div>
              <button className="add-story-btn">
                <Plus size={24} />
              </button>
            </div>
            <div className="story-card" onClick={handleAddExperience}>
              <div className="story-content">
                <h4>Other experience</h4>
                <p>
                  {formData.otherExperience ||
                    "What do you do when you're not driving for Vaye?"}
                </p>
              </div>
              <button className="add-story-btn">
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Fact Modal */}
      {showFunFactModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFunFactModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Fun Fact</h3>
              <button
                className="modal-close"
                onClick={() => setShowFunFactModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <textarea
              value={tempFunFact}
              onChange={(e) => setTempFunFact(e.target.value)}
              placeholder="What's something that makes you unique?"
              className="modal-textarea"
              maxLength={150}
            />
            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => setShowFunFactModal(false)}
              >
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleSaveFunFact}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowExperienceModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Other Experience</h3>
              <button
                className="modal-close"
                onClick={() => setShowExperienceModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <textarea
              value={tempExperience}
              onChange={(e) => setTempExperience(e.target.value)}
              placeholder="What do you do when you're not driving for Vaye?"
              className="modal-textarea"
              maxLength={150}
            />
            <div className="modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => setShowExperienceModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn primary"
                onClick={handleSaveExperience}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View All Compliments Modal */}
      {showViewAllModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowViewAllModal(false)}
        >
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>All Compliments</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewAllModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="all-compliments-grid">
              {compliments.map((compliment, index) => {
                const IconComponent = compliment.icon;
                return (
                  <div key={index} className="compliment-card">
                    <div
                      className="compliment-icon"
                      style={{ backgroundColor: compliment.color }}
                    >
                      <IconComponent size={24} />
                      <span className="compliment-count">
                        {compliment.count}
                      </span>
                    </div>
                    <span className="compliment-name">{compliment.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;

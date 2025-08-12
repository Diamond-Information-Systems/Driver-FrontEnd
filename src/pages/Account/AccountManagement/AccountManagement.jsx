import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./AccountManagement.css";
import { getProfile, updateProfile, uploadDocument } from "../../../services/profileService";
import { useAuth } from "../../../context/AuthContext";

// Mock user data
const mockUserData = {
  name: "Nhlamulo",
  email: "nhlamuloc17@gmail.com",
  avatar: "", // Will be updated when user uploads
  phone: "+27 82 123 4567",
  lastPasswordChange: "18 June 2025",
  devices: [
    {
      id: 1,
      name: "iPhone 14 Pro Max",
      location: "Johannesburg and Pretoria, South Africa",
      apps: "Vaye Web, Vaye Driver",
      isCurrent: true,
      type: "mobile",
    },
    {
      id: 2,
      name: "Android phone",
      location: "Cape Town, South Africa",
      apps: "Vaye Driver",
      isCurrent: false,
      type: "mobile",
    },
  ],
};

const AccountManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user: authResponse } = useAuth();

  // Extract user data from auth response structure
  const authUser = authResponse?.user || null;
  
  //log user data
  console.log("Auth Response:", authResponse);
  console.log("Extracted User:", authUser);

  // State management
  const [activeTab, setActiveTab] = useState("home");
  const [userData, setUserData] = useState(authUser || mockUserData);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [driverDocs, setDriverDocs] = useState({});
  
  // Load profile from backend
  useEffect(() => {
    if (authUser) {
      // Merge real user data with fallback values for missing fields
      const mergedUserData = {
        ...mockUserData, // Fallback values
        ...authUser,     // Real user data overrides
      };
      setUserData(mergedUserData);
      setEditName(authUser.name || "");
      setEditPhone(authUser.phone || "");
    } else {
      // Fallback: load from API if not in context
      setProfileLoading(true);
      getProfile(authResponse?.token)
        .then((data) => {
          const mergedData = {
            ...mockUserData,
            ...userData,
            ...data
          };
          setUserData(mergedData);
          setEditName(data.name || "");
          setEditPhone(data.phone || "");
        })
        .catch(() => setProfileError("Failed to load profile."))
        .finally(() => setProfileLoading(false));
    }
    // eslint-disable-next-line
  }, [authUser]);
  
  const [showModal, setShowModal] = useState(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState({
    step: 1,
    secret: "HMCI-CJND-NKU5-G4CA-N4GR-AROI-PLDM-WCXG",
    qrCode: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Generate QR Code data
  const generateQRCode = () => {
    const qrData = `otpauth://totp/Vaye:${userData.email}?secret=${twoFactorSetup.secret}&issuer=Vaye`;
    return qrData;
  };

  // Handle navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  // Handle modal operations
  const openModal = (modalType) => {
    setShowModal(modalType);
  };

  const closeModal = () => {
    setShowModal(null);
    setTwoFactorSetup({ ...twoFactorSetup, step: 1 });
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData({
          ...userData,
          avatar: e.target.result,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle 2FA setup steps
  const handle2FANext = () => {
    if (twoFactorSetup.step < 3) {
      setTwoFactorSetup({ ...twoFactorSetup, step: twoFactorSetup.step + 1 });
    } else {
      // Complete setup
      closeModal();
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeTab
            userData={userData}
            onPhotoUpload={triggerPhotoUpload}
            isUploading={isUploading}
            onTabSwitch={handleTabSwitch}
          />
        );
      case "personal":
        return (
          <PersonalInfoTab
            userData={userData}
            editMode={editMode}
            setEditMode={setEditMode}
            editName={editName}
            setEditName={setEditName}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            driverDocs={driverDocs}
            setDriverDocs={setDriverDocs}
            onSave={async () => {
              setProfileLoading(true);
              setProfileError("");
              setProfileSuccess("");
              try {
                await updateProfile({ name: editName, phone: editPhone }, authResponse?.token);
                for (const [docType, file] of Object.entries(driverDocs)) {
                  if (file) await uploadDocument(docType, file, authResponse?.token);
                }
                setUserData({ ...userData, name: editName, phone: editPhone });
                setProfileSuccess("Profile updated successfully.");
                setEditMode(false);
              } catch {
                setProfileError("Failed to update profile.");
              } finally {
                setProfileLoading(false);
              }
            }}
            profileLoading={profileLoading}
            profileError={profileError}
            profileSuccess={profileSuccess}
          />
        );
      case "security":
        return <SecurityTab userData={userData} onOpenModal={openModal} />;
      case "privacy":
        return <PrivacyTab />;
      default:
        return (
          <HomeTab
            userData={userData}
            onPhotoUpload={triggerPhotoUpload}
            isUploading={isUploading}
            onTabSwitch={handleTabSwitch}
          />
        );
    }
  };

  return (
    <div className="vaye-account-page-unique">
      {/* Header */}
      <header className="vaye-account-header-unique">
        <button
          className="vaye-account-close-btn-unique"
          onClick={handleBack}
          type="button"
          aria-label="Close"
        >
          ×
        </button>

        <h1 className="vaye-account-title-unique">Vaye account</h1>

        <div className="vaye-account-spacer-unique"></div>
      </header>

      {/* Tab Navigation */}
      <nav className="vaye-account-tabs-unique">
        <button
          className={`vaye-account-tab-unique ${
            activeTab === "home" ? "active" : ""
          }`}
          onClick={() => handleTabSwitch("home")}
        >
          Home
        </button>
        <button
          className={`vaye-account-tab-unique ${
            activeTab === "personal" ? "active" : ""
          }`}
          onClick={() => handleTabSwitch("personal")}
        >
          Personal info
        </button>
        <button
          className={`vaye-account-tab-unique ${
            activeTab === "security" ? "active" : ""
          }`}
          onClick={() => handleTabSwitch("security")}
        >
          Security
        </button>
        <button
          className={`vaye-account-tab-unique ${
            activeTab === "privacy" ? "active" : ""
          }`}
          onClick={() => handleTabSwitch("privacy")}
        >
          Privacy & data
        </button>
      </nav>

      {/* Content */}
      <main className="vaye-account-content-unique">{renderTabContent()}</main>

      {/* Modals */}
      {showModal === "2fa" && (
        <TwoFactorModal
          userData={userData}
          twoFactorSetup={twoFactorSetup}
          onNext={handle2FANext}
          onClose={closeModal}
          generateQRCode={generateQRCode}
        />
      )}

      {showModal === "password" && <PasswordModal onClose={closeModal} />}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{ display: "none" }}
      />
    </div>
  );
};

// Home Tab Component
const HomeTab = ({ userData, onPhotoUpload, isUploading, onTabSwitch }) => (
  <div className="vaye-home-tab-unique">
    {/* Profile Section */}
    <div className="vaye-profile-section-unique">
      <div className="vaye-profile-avatar-unique" onClick={onPhotoUpload}>
        {isUploading ? (
          <div className="vaye-avatar-loading-unique">
            <div className="vaye-spinner-unique"></div>
          </div>
        ) : userData.profileImage || userData.avatar ? (
          <img
            src={userData.profileImage || userData.avatar}
            alt="Profile"
            className="vaye-avatar-img-unique"
          />
        ) : (
          <div className="vaye-avatar-placeholder-unique">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <div className="vaye-avatar-edit-overlay-unique">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 4H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="13"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <h2 className="vaye-profile-name-unique">{userData.name}</h2>
      <p className="vaye-profile-email-unique">{userData.email}</p>
      
      {/* Driver Statistics */}
      {userData.totalTrips !== undefined && (
        <div className="vaye-driver-stats-unique">
          <div className="vaye-stat-item-unique">
            <span className="vaye-stat-number">{userData.totalTrips}</span>
            <span className="vaye-stat-label">Trips</span>
          </div>
          {userData.rating > 0 && (
            <div className="vaye-stat-item-unique">
              <span className="vaye-stat-number">{userData.rating}⭐</span>
              <span className="vaye-stat-label">Rating</span>
            </div>
          )}
          {userData.memberSince && (
            <div className="vaye-stat-item-unique">
              <span className="vaye-stat-number">{userData.memberSince}</span>
              <span className="vaye-stat-label">Member since</span>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Quick Actions */}
    <div className="vaye-quick-actions-unique">
      <div
        className="vaye-action-card-unique"
        onClick={() => onTabSwitch("personal")}
      >
        <div className="vaye-action-icon-unique">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="vaye-action-label-unique">Personal info</p>
      </div>

      <div
        className="vaye-action-card-unique"
        onClick={() => onTabSwitch("security")}
      >
        <div className="vaye-action-icon-unique">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="vaye-action-label-unique">Security</p>
      </div>

      <div
        className="vaye-action-card-unique"
        onClick={() => onTabSwitch("privacy")}
      >
        <div className="vaye-action-icon-unique">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="vaye-action-label-unique">Privacy & data</p>
      </div>
    </div>

    {/* Suggestions */}
    <div className="vaye-suggestions-unique">
      <h3 className="vaye-suggestions-title-unique">Suggestions</h3>

      <div className="vaye-suggestion-card-unique">
        <div className="vaye-suggestion-content-unique">
          <div className="vaye-suggestion-icon-unique">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="vaye-suggestion-text-unique">
            <h4>Complete your account check-up</h4>
            <p>
              Complete your account check-up to make Vaye work better for you
              and keep you secure.
            </p>
            <button className="vaye-suggestion-btn-unique">
              Begin check-up
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Personal Info Tab Component (Redesigned, Accessible, Modern)
const PersonalInfoTab = ({ userData, editMode, setEditMode, editName, setEditName, editPhone, setEditPhone, driverDocs, setDriverDocs, onSave, profileLoading, profileError, profileSuccess }) => (
  <div className="vaye-personal-tab-unique">
    <h2 className="vaye-tab-title-unique">Personal Information</h2>
    {profileError && <div className="vaye-form-error">{profileError}</div>}
    {profileSuccess && <div className="vaye-form-success">{profileSuccess}</div>}
    {editMode ? (
      <form className="vaye-profile-edit-form" onSubmit={e => { e.preventDefault(); onSave(); }}>
        <div className="vaye-form-group">
          <label htmlFor="editName">Full Name</label>
          <input
            id="editName"
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            placeholder="Enter your full name"
            autoFocus
          />
        </div>
        <div className="vaye-form-group">
          <label htmlFor="editPhone">Phone Number</label>
          <input
            id="editPhone"
            type="tel"
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
            required
            placeholder="e.g. +27 82 123 4567"
          />
        </div>
        <div className="vaye-form-group">
          <label htmlFor="licenseUpload">Driver's License</label>
          <input
            id="licenseUpload"
            type="file"
            accept="application/pdf,image/*"
            onChange={e => setDriverDocs({ ...driverDocs, license: e.target.files[0] })}
            aria-describedby="licenseHelp"
          />
          <small id="licenseHelp" className="vaye-form-helper">PDF, JPG, or PNG. Max 5MB.</small>
          {driverDocs.license && <div className="vaye-file-name">Selected: {driverDocs.license.name}</div>}
        </div>
        <div className="vaye-form-group">
          <label htmlFor="idUpload">National ID / Passport</label>
          <input
            id="idUpload"
            type="file"
            accept="application/pdf,image/*"
            onChange={e => setDriverDocs({ ...driverDocs, id: e.target.files[0] })}
            aria-describedby="idHelp"
          />
          <small id="idHelp" className="vaye-form-helper">PDF, JPG, or PNG. Max 5MB.</small>
          {driverDocs.id && <div className="vaye-file-name">Selected: {driverDocs.id.name}</div>}
        </div>
        <div className="vaye-form-actions">
          <button type="submit" className="vaye-btn-primary" disabled={profileLoading} aria-busy={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="vaye-btn-secondary" onClick={() => setEditMode(false)} disabled={profileLoading}>
            Cancel
          </button>
        </div>
      </form>
    ) : (
      <div className="vaye-info-section-unique">
        <div className="vaye-info-item-unique">
          <h3>Name</h3>
          <p>{userData.name}</p>
        </div>
        <div className="vaye-info-item-unique">
          <h3>Email</h3>
          <p>{userData.email}</p>
        </div>
        <div className="vaye-info-item-unique">
          <h3>Phone</h3>
          <p>{userData.phone}</p>
        </div>
        <button className="vaye-btn-primary" onClick={() => setEditMode(true)}>
          Edit Profile
        </button>
      </div>
    )}
  </div>
);

// Security Tab Component
const SecurityTab = ({ userData, onOpenModal }) => (
  <div className="vaye-security-tab-unique">
    <h2 className="vaye-tab-title-unique">Security</h2>

    <div className="vaye-security-section-unique">
      <h3 className="vaye-security-section-title-unique">Logging in to Vaye</h3>

      <div
        className="vaye-security-item-unique"
        onClick={() => onOpenModal("password")}
      >
        <div className="vaye-security-content-unique">
          <h4>Password</h4>
          <p>••••••••••</p>
          <span className="vaye-security-meta-unique">
            Last changed {userData.lastPasswordChange || 'Recently'}
          </span>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="vaye-security-item-unique">
        <div className="vaye-security-content-unique">
          <h4>Passkeys</h4>
          <p>Passkeys are easier and more secure than passwords.</p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="vaye-security-item-unique">
        <div className="vaye-security-content-unique">
          <h4>Authenticator app</h4>
          <p>
            Set up your authenticator app to add an extra layer of security.
          </p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className="vaye-security-item-unique"
        onClick={() => onOpenModal("2fa")}
      >
        <div className="vaye-security-content-unique">
          <h4>2-step verification</h4>
          <p>
            Add additional security to your account with 2-step verification.
          </p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="vaye-security-item-unique">
        <div className="vaye-security-content-unique">
          <h4>Recovery phone</h4>
          <p>Add a backup phone number to access your account</p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>

    <div className="vaye-security-section-unique">
      <h3 className="vaye-security-section-title-unique">
        Connected social apps
      </h3>
      <p className="vaye-security-description-unique">
        Once you've allowed social apps to sign in to your Vaye account, you'll
        see them here.
      </p>
    </div>

    <div className="vaye-security-section-unique">
      <h3 className="vaye-security-section-title-unique">Login activity</h3>
      <p className="vaye-security-description-unique">
        You're logged in or have been logged in on these devices within the last
        30 days. Multiple logins from the same device may appear.
      </p>

      {(userData.devices || []).map((device) => (
        <div key={device.id} className="vaye-device-item-unique">
          <div className="vaye-device-icon-unique">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="5"
                y="2"
                width="14"
                height="20"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="18"
                x2="12.01"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="vaye-device-content-unique">
            <h4>{device.name}</h4>
            {device.isCurrent && (
              <span className="vaye-current-login-unique">
                Your current login
              </span>
            )}
            <p>{device.location}</p>
            <p>{device.apps}</p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}

      <div className="vaye-device-item-unique">
        <div className="vaye-device-icon-unique">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="vaye-device-content-unique">
          <h4>Sign out all devices</h4>
          <p>All except your current login</p>
        </div>
      </div>
    </div>
  </div>
);

// Privacy Tab Component
const PrivacyTab = () => (
  <div className="vaye-privacy-tab-unique">
    <h2 className="vaye-tab-title-unique">Privacy & data</h2>

    <div className="vaye-privacy-section-unique">
      <h3 className="vaye-privacy-section-title-unique">Privacy</h3>

      <div className="vaye-privacy-item-unique">
        <div className="vaye-privacy-content-unique">
          <h4>Privacy Centre</h4>
          <p>Take control of your privacy and learn how we protect it.</p>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>

    <div className="vaye-privacy-section-unique">
      <h3 className="vaye-privacy-section-title-unique">
        Third-party apps with account access
      </h3>
      <p className="vaye-privacy-description-unique">
        Once you allow access to third-party apps, you'll see them here.{" "}
        <span className="vaye-learn-more-unique">Learn more</span>
      </p>
    </div>
  </div>
);

// Two Factor Authentication Modal
const TwoFactorModal = ({
  userData,
  twoFactorSetup,
  onNext,
  onClose,
  generateQRCode,
}) => (
  <div className="vaye-modal-overlay-unique">
    <div className="vaye-modal-unique">
      <div className="vaye-modal-header-unique">
        <button className="vaye-modal-close-unique" onClick={onClose}>
          ×
        </button>
        <h2>Turn on 2-step verification</h2>
      </div>

      <div className="vaye-modal-content-unique">
        {twoFactorSetup.step === 1 && (
          <div className="vaye-2fa-step-unique">
            <div className="vaye-2fa-icon-unique">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p>
              Add extra security to your account with 2-step verification and
              prevent unauthorised access to your account.
            </p>
            <p>
              2-step verification requires an additional authentication step
              when logging in to your account.
            </p>
          </div>
        )}

        {twoFactorSetup.step === 2 && (
          <div className="vaye-2fa-step-unique">
            <h3>Authentication instructions</h3>
            <div className="vaye-qr-container-unique">
              <QRCodeGenerator data={generateQRCode()} />
            </div>
            <div className="vaye-secret-key-unique">
              <p>{twoFactorSetup.secret}</p>
              <button className="vaye-copy-btn-unique">Copy key</button>
            </div>
            <div className="vaye-2fa-instructions-unique">
              <p>
                1. Get an authenticator app on your phone or computer (e.g. Duo,
                Google Authenticator)
              </p>
              <p>
                2. Scan the QR code or copy the key to your preferred
                authenticator app.
              </p>
              <p>
                3. Enter the 6-digit code generated by your authenticator app on
                the next screen.
              </p>
            </div>
          </div>
        )}

        {twoFactorSetup.step === 3 && (
          <div className="vaye-2fa-step-unique">
            <h3>Enter verification code</h3>
            <p>Enter the 6-digit code from your authenticator app</p>
            <input
              type="text"
              className="vaye-2fa-code-input-unique"
              placeholder="000000"
              maxLength="6"
            />
          </div>
        )}
      </div>

      <div className="vaye-modal-actions-unique">
        {twoFactorSetup.step === 1 && (
          <button className="vaye-modal-primary-btn-unique" onClick={onNext}>
            Get started
          </button>
        )}
        {twoFactorSetup.step === 2 && (
          <button className="vaye-modal-primary-btn-unique" onClick={onNext}>
            Next
          </button>
        )}
        {twoFactorSetup.step === 3 && (
          <button className="vaye-modal-primary-btn-unique" onClick={onNext}>
            Verify
          </button>
        )}
        <button className="vaye-modal-secondary-btn-unique" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// Password Modal
const PasswordModal = ({ onClose }) => (
  <div className="vaye-modal-overlay-unique">
    <div className="vaye-modal-unique">
      <div className="vaye-modal-header-unique">
        <button className="vaye-modal-close-unique" onClick={onClose}>
          ×
        </button>
        <h2>Change Password</h2>
      </div>

      <div className="vaye-modal-content-unique">
        <div className="vaye-password-form-unique">
          <div className="vaye-form-group-unique">
            <label>Current Password</label>
            <input type="password" className="vaye-form-input-unique" />
          </div>
          <div className="vaye-form-group-unique">
            <label>New Password</label>
            <input type="password" className="vaye-form-input-unique" />
          </div>
          <div className="vaye-form-group-unique">
            <label>Confirm New Password</label>
            <input type="password" className="vaye-form-input-unique" />
          </div>
        </div>
      </div>

      <div className="vaye-modal-actions-unique">
        <button className="vaye-modal-primary-btn-unique">
          Update Password
        </button>
        <button className="vaye-modal-secondary-btn-unique" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// QR Code Generator Component
const QRCodeGenerator = ({ data }) => {
  const [qrSvg, setQrSvg] = useState("");

  React.useEffect(() => {
    // Simple QR code generation (placeholder pattern)
    // In a real app, you'd use a library like 'qrcode' or 'qr-code-generator'
    const generateQRPattern = () => {
      const size = 21;
      const pattern = [];

      // Create a simple pattern for demonstration
      for (let i = 0; i < size; i++) {
        pattern[i] = [];
        for (let j = 0; j < size; j++) {
          // Create a pseudo-random pattern based on data
          const hash = (data.charCodeAt((i + j) % data.length) + i + j) % 3;
          pattern[i][j] = hash > 0;
        }
      }

      // Add corner squares (QR code finder patterns)
      const addFinderPattern = (startX, startY) => {
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            if (startX + i < size && startY + j < size) {
              const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
              const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
              pattern[startX + i][startY + j] = isBorder || isInner;
            }
          }
        }
      };

      addFinderPattern(0, 0);
      addFinderPattern(0, size - 7);
      addFinderPattern(size - 7, 0);

      return pattern;
    };

    const pattern = generateQRPattern();
    const cellSize = 8;
    const padding = 20;
    const totalSize = pattern.length * cellSize + padding * 2;

    let svg = `<svg width="${totalSize}" height="${totalSize}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`;

    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (pattern[i][j]) {
          svg += `<rect x="${padding + j * cellSize}" y="${
            padding + i * cellSize
          }" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }

    svg += "</svg>";
    setQrSvg(svg);
  }, [data]);

  return (
    <div
      className="vaye-qr-code-unique"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
    />
  );
};

export default AccountManagement;

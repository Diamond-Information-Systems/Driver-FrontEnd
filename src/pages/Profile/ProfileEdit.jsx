import React, { useState, useEffect } from "react";
import "./ProfileEdit.css";
import { getProfile, updateProfile, uploadDocument } from "../../services/profileService";
import { useAuth } from "../../context/AuthContext";

const ProfileEdit = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth(); // Get user object which contains the token


  useEffect(() => {
    setLoading(true);
    getProfile(user?.token)
      .then((data) => {
        setName(data.name || "");
        setPhone(data.phone || "");
        setPhotoUrl(data.photoUrl || "");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [user?.token]);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleDocumentChange = (e, docType) => {
    setDocuments({ ...documents, [docType]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Update profile info
      await updateProfile({ name, phone }, user?.token);
      // Upload profile photo if changed
      if (photo) {
        await uploadDocument("profilePhoto", photo, user?.token);
      }
      // Upload documents
      for (const [docType, file] of Object.entries(documents)) {
        if (file) await uploadDocument(docType, file, user?.token);
      }
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-page">
      <h2>Edit Profile</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Phone:
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <label>
          Profile Photo:
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={photoUrl} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            </div>
          )}
        </label>
        <div className="documents-section">
          <h3>Driver Documents</h3>
          <label>
            Driver's License:
            <input type="file" accept="application/pdf,image/*" onChange={(e) => handleDocumentChange(e, "license")} />
          </label>
          <label>
            National ID/Passport:
            <input type="file" accept="application/pdf,image/*" onChange={(e) => handleDocumentChange(e, "id")} />
          </label>
        </div>
        <button type="submit" disabled={loading}>Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileEdit;

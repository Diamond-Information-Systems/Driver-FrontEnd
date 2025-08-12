import React, { useState, useEffect } from "react";
import {
  IoCarSport,
  IoChevronBack,
  IoChevronForward,
  IoAdd,
  IoEllipsisVertical,
  IoClose,
  IoDocument,
  IoCheckmarkCircle,
  IoWarning,
  IoPersonCircle,
  IoCard,
  IoShield,
  IoCamera,
  IoBusinessOutline,
  IoReceiptOutline,
  IoRefresh,
  IoTrash,
  IoSettings,
} from "react-icons/io5";
import "./VehicleStyles.css";
import { vehicleService } from "../../../services/vehicleService";
import { useAuth } from "../../../context/AuthContext";

// Vehicle Documents Component
const VehicleDocuments = ({ vehicle, onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState({});
  const { user } = useAuth(); // Get user object which contains the token

  const driverRequirements = [
    {
      title: "Driving Evaluation Report",
      status: "attention",
      statusText: "Needs your attention",
      icon: <IoDocument />,
    },
    {
      title: "Terms and Conditions",
      status: "completed",
      statusText: "Completed",
      icon: <IoDocument />,
    },
    {
      title: "PrDP Card",
      status: "completed",
      statusText: "Completed",
      icon: <IoCard />,
    },
    {
      title: "Background Check Result Document/Safety Screening Results",
      status: "completed",
      statusText: "Completed",
      icon: <IoShield />,
    },
    {
      title: "Profile photo",
      status: "completed",
      statusText: "Completed",
      icon: <IoCamera />,
    },
  ];

  const vehicleDocuments = [
    {
      title: "Vehicle Insurance Policy",
      type: "insurance",
      status: "pending",
      statusText: "Upload required",
      icon: <IoBusinessOutline />,
    },
    {
      title: "Vehicle Registration",
      type: "registration",
      status: "pending",
      statusText: "Upload required",
      icon: <IoReceiptOutline />,
    },
  ];

  useEffect(() => {
    loadDocuments();
  }, [vehicle]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleDocuments(vehicle._id, user?.token);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType, file) => {
    try {
      setUploadLoading(prev => ({ ...prev, [documentType]: true }));
      await vehicleService.uploadVehicleDocument(vehicle._id, documentType, file, user?.token);
      await loadDocuments(); // Reload documents
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadLoading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const getDocumentStatus = (docType) => {
    const doc = documents.find(d => d.type === docType);
    if (doc) {
      return doc.verified ? "completed" : "pending";
    }
    return "attention";
  };

  const getDocumentStatusText = (docType) => {
    const doc = documents.find(d => d.type === docType);
    if (doc) {
      return doc.verified ? "Verified" : "Under Review";
    }
    return "Upload required";
  };

  return (
    <div className="documents-page">
      <header className="header">
        <button className="back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1>{vehicle.make} {vehicle.model}</h1>
        <button className="help-btn">Help</button>
      </header>

      <div className="content">
        <h2 className="page-title">Driver requirements</h2>

        <div className="requirements-section">
          {driverRequirements.map((item, index) => (
            <div key={index} className="requirement-item">
              <div className="requirement-icon">{item.icon}</div>
              <div className="requirement-content">
                <h3>{item.title}</h3>
                <div className={`status-badge ${item.status}`}>
                  {item.status === "completed" ? (
                    <IoCheckmarkCircle />
                  ) : (
                    <IoWarning />
                  )}
                  <span>{item.statusText}</span>
                </div>
              </div>
              <IoChevronForward className="chevron" />
            </div>
          ))}
        </div>

        <h2 className="page-title">Vehicle documents</h2>

        <div className="requirements-section">
          {vehicleDocuments.map((item, index) => {
            const status = getDocumentStatus(item.type);
            const statusText = getDocumentStatusText(item.type);
            const isUploading = uploadLoading[item.type];

            return (
              <div key={index} className="requirement-item">
                <div className="requirement-icon">{item.icon}</div>
                <div className="requirement-content">
                  <h3>{item.title}</h3>
                  <div className={`status-badge ${status}`}>
                    {status === "completed" ? (
                      <IoCheckmarkCircle />
                    ) : (
                      <IoWarning />
                    )}
                    <span>{isUploading ? "Uploading..." : statusText}</span>
                  </div>
                </div>
                <div className="document-actions">
                  <input
                    type="file"
                    id={`upload-${item.type}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleDocumentUpload(item.type, file);
                      }
                    }}
                    disabled={isUploading}
                  />
                  <button
                    className="upload-btn"
                    onClick={() => document.getElementById(`upload-${item.type}`).click()}
                    disabled={isUploading}
                  >
                    {status === "completed" ? "Replace" : "Upload"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Add Vehicle Modal Component
const AddVehicleModal = ({ onClose, onAddVehicle }) => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    vehicleType: "sedan",
    capacity: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth(); // Get user object which contains the token

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.make || !formData.model || !formData.licensePlate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newVehicle = await vehicleService.addVehicle(formData, user?.token);
      onAddVehicle(newVehicle.vehicle);
      onClose();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setError(error.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-vehicle-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Add New Vehicle</h3>
          <p>Enter your vehicle details to get started</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="add-vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="make">Make *</label>
              <input
                type="text"
                id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="e.g., Toyota"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Camry"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="e.g., White"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="licensePlate">License Plate *</label>
            <input
              type="text"
              id="licensePlate"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
              placeholder="e.g., ABC-123"
              required
              disabled={loading}
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicleType">Vehicle Type</label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Passenger Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                max="8"
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Vehicle Options Modal Component
const VehicleOptionsModal = ({ vehicle, onClose, onViewDocuments, onRemoveVehicle, onUpdateStatus }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Get user object which contains the token

  const handleRemoveVehicle = async () => {
    if (window.confirm(`Are you sure you want to remove ${vehicle.make} ${vehicle.model}?`)) {
      try {
        setLoading(true);
        await vehicleService.deleteVehicle(vehicle._id, user?.token);
        onRemoveVehicle(vehicle._id);
        onClose();
      } catch (error) {
        console.error('Error removing vehicle:', error);
        alert('Failed to remove vehicle. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      const newStatus = !vehicle.isActive;
      await vehicleService.updateVehicleStatus(vehicle._id, newStatus, user?.token);
      onUpdateStatus(vehicle._id, newStatus);
      onClose();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Failed to update vehicle status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vehicle.make} {vehicle.model}</h3>
          <p>{vehicle.licensePlate}</p>
        </div>

        <div className="modal-options">
          <button className="option-btn" onClick={() => onViewDocuments(vehicle)}>
            <IoDocument size={20} />
            View documents
          </button>

          <button className="option-btn" onClick={handleToggleStatus} disabled={loading}>
            <IoSettings size={20} />
            {vehicle.isActive ? 'Deactivate' : 'Activate'} vehicle
          </button>

          <button className="option-btn danger" onClick={handleRemoveVehicle} disabled={loading}>
            <IoTrash size={20} />
            Remove vehicle
          </button>
        </div>

        <button className="close-btn" onClick={onClose} disabled={loading}>
          {loading ? 'Processing...' : 'Close'}
        </button>
      </div>
    </div>
  );
};

// Vehicles List Component
const VehiclesList = ({ onViewDocuments }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, verified: 0 });
  const { user } = useAuth(); // Get user object which contains the token

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await vehicleService.getVehicles(user?.token);
      setVehicles(response.vehicles || []);
      setStats(response.stats || { total: 0, active: 0, pending: 0, verified: 0 });
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setError('Failed to load vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = (newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      active: prev.active + (newVehicle.isActive ? 1 : 0)
    }));
  };

  const handleRemoveVehicle = (vehicleId) => {
    setVehicles(prev => prev.filter(v => v._id !== vehicleId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1
    }));
  };

  const handleUpdateStatus = (vehicleId, isActive) => {
    setVehicles(prev => prev.map(v => 
      v._id === vehicleId ? { ...v, isActive } : v
    ));
  };

  const handleOptionsClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowOptionsModal(true);
  };

  const handleViewDocuments = (vehicle) => {
    setShowOptionsModal(false);
    onViewDocuments(vehicle);
  };

  const getVehicleStatusBadge = (vehicle) => {
    if (!vehicle.isActive) {
      return <span className="status-badge inactive">Inactive</span>;
    }
    
    const hasAllDocs = vehicle.documents && vehicle.documents.length >= 2;
    const allVerified = hasAllDocs && vehicle.documents.every(doc => doc.verified);
    
    if (allVerified) {
      return <span className="status-badge active">Active</span>;
    } else {
      return <span className="status-badge pending">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="vehicles-page">
        <header className="header">
          <h1>Vehicles</h1>
          <button className="refresh-btn" onClick={loadVehicles}>
            <IoRefresh size={20} />
          </button>
        </header>
        <div className="loading-state">
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-page">
        <header className="header">
          <h1>Vehicles</h1>
          <button className="refresh-btn" onClick={loadVehicles}>
            <IoRefresh size={20} />
          </button>
        </header>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadVehicles} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicles-page">
      <header className="header">
        <h1>Vehicles</h1>
        <button className="refresh-btn" onClick={loadVehicles}>
          <IoRefresh size={20} />
        </button>
      </header>

      <div className="content">
        {/* Vehicle Statistics */}
        <div className="stats-row">
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p>Total Vehicles</p>
          </div>
          <div className="stat-card">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* Add Vehicle Button */}
        <button className="add-vehicle-btn" onClick={() => setShowAddModal(true)}>
          <IoAdd size={24} />
          Add vehicle
        </button>

        {/* Vehicles List */}
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <IoCarSport size={64} className="empty-icon" />
            <h3>No vehicles added</h3>
            <p>Add your first vehicle to start accepting rides</p>
            <button className="add-vehicle-btn primary" onClick={() => setShowAddModal(true)}>
              <IoAdd size={20} />
              Add your first vehicle
            </button>
          </div>
        ) : (
          <div className="vehicles-list">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-icon">
                  <IoCarSport size={32} />
                </div>
                <div className="vehicle-info">
                  <h3>{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                  <p className="license-plate">{vehicle.licensePlate}</p>
                  <p className="vehicle-details">
                    {vehicle.color} • {vehicle.vehicleType} • {vehicle.capacity} seats
                  </p>
                  {getVehicleStatusBadge(vehicle)}
                </div>
                <button
                  className="options-btn"
                  onClick={() => handleOptionsClick(vehicle)}
                >
                  <IoEllipsisVertical size={20} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Opportunities Card */}
        <div className="opportunities-card">
          <h3>Explore vehicle opportunities</h3>
          <p>
            Connect with a fleet partner or browse rental or purchase offers if
            you need another vehicle.
          </p>
          <button className="learn-more-btn">
            Learn more
            <IoChevronForward size={16} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showOptionsModal && selectedVehicle && (
        <VehicleOptionsModal
          vehicle={selectedVehicle}
          onClose={() => setShowOptionsModal(false)}
          onViewDocuments={handleViewDocuments}
          onRemoveVehicle={handleRemoveVehicle}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {showAddModal && (
        <AddVehicleModal
          onClose={() => setShowAddModal(false)}
          onAddVehicle={handleAddVehicle}
        />
      )}
    </div>
  );
};

// Main Vehicle Management Component
const VehicleManagement = () => {
  const [currentPage, setCurrentPage] = useState("vehicles");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleViewDocuments = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentPage("documents");
  };

  const handleBackToVehicles = () => {
    setCurrentPage("vehicles");
    setSelectedVehicle(null);
  };

  if (currentPage === "documents") {
    return (
      <VehicleDocuments
        vehicle={selectedVehicle}
        onBack={handleBackToVehicles}
      />
    );
  }

  return <VehiclesList onViewDocuments={handleViewDocuments} />;
};

export default VehicleManagement;

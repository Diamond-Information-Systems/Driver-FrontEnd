import React, { useState } from "react";
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
} from "react-icons/io5";
import "./VehicleStyles.css";

// Vehicle Documents Component - SEPARATE COMPONENT
const VehicleDocuments = ({ vehicle, onBack }) => {
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
      status: "completed",
      statusText: "Completed",
      icon: <IoBusinessOutline />,
    },
    {
      title: "Meter Taxi Operating License (or Application Receipt)",
      status: "completed",
      statusText: "Completed",
      icon: <IoReceiptOutline />,
    },
  ];

  return (
    <div className="documents-page">
      <header className="header">
        <button className="back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1>Uber</h1>
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

        <div className="vehicle-section">
          <h2 className="vehicle-section-title">
            {vehicle.name} {vehicle.plate}
          </h2>

          {vehicleDocuments.map((item, index) => (
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
      </div>
    </div>
  );
};

// Vehicle Modal Component
const VehicleModal = ({ vehicle, onClose, onViewDocuments }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vehicle.name}</h3>
          <p>{vehicle.plate}</p>
        </div>

        <button className="view-documents-btn" onClick={onViewDocuments}>
          <IoDocument size={20} />
          View documents
        </button>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Add Vehicle Modal Component
const AddVehicleModal = ({ onClose, onAddVehicle }) => {
  const [vehicleName, setVehicleName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("trips");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (vehicleName && plateNumber) {
      const newVehicle = {
        id: Date.now(),
        name: vehicleName,
        plate: plateNumber.toUpperCase(),
        type: vehicleType === "trips" ? "Trips only" : "Premium rides",
        status: "pending",
      };
      onAddVehicle(newVehicle);
      onClose();
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

        <form onSubmit={handleSubmit} className="add-vehicle-form">
          <div className="form-group">
            <label htmlFor="vehicleName">Vehicle Make & Model</label>
            <input
              type="text"
              id="vehicleName"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="e.g., 2023 Toyota Camry"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="plateNumber">License Plate Number</label>
            <input
              type="text"
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g., ABC123DE"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleType">Service Type</label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="trips">Trips only</option>
              <option value="premium">Premium rides</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="submit" className="add-btn">
              <IoAdd size={20} />
              Add Vehicle
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Vehicle Options Modal Component
const VehicleOptionsModal = ({ vehicle, onClose, onViewDocuments }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vehicle.name}</h3>
          <p>{vehicle.plate}</p>
        </div>

        <div className="modal-options">
          <button className="option-btn" onClick={onViewDocuments}>
            <IoDocument size={20} />
            View documents
          </button>

          <button className="option-btn">
            <IoCarSport size={20} />
            Vehicle settings
          </button>

          <button className="option-btn danger">
            <IoClose size={20} />
            Remove vehicle
          </button>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// Vehicles List Component - Updated with Add Vehicle functionality
const VehiclesList = ({ onViewDocuments }) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      name: "2022 Toyota Agya",
      plate: "KT38PZGP",
      type: "Trips only",
      status: "active",
    },
    {
      id: 2,
      name: "2020 Honda Civic",
      plate: "AB12CDE3",
      type: "Premium rides",
      status: "active",
    },
    {
      id: 3,
      name: "2019 Toyota Corolla",
      plate: "XY98ZWV7",
      type: "Trips only",
      status: "pending",
    },
  ]);

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowOptionsModal(true);
  };

  const handleMoreClick = (e, vehicle) => {
    e.stopPropagation();
    setSelectedVehicle(vehicle);
    setShowOptionsModal(true);
  };

  const handleViewDocuments = () => {
    setShowOptionsModal(false);
    onViewDocuments(selectedVehicle);
  };

  const handleAddVehicle = (newVehicle) => {
    setVehicles([...vehicles, newVehicle]);
  };

  return (
    <div className="vehicles-page">
      <header className="header">
        <button className="back-btn"
        onClick={() => window.history.back()}
        >
          <IoChevronBack size={24} />
        </button>
        <h1>Vehicles</h1>
        <button className="vehicle-icon" onClick={() => setShowAddModal(true)}>
          <IoCarSport size={24} />
        </button>
      </header>

      <div className="content">
        <div className="vehicles-list">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="vehicle-card"
              onClick={() => handleVehicleClick(vehicle)}
            >
              <div className="vehicle-image">
                <IoCarSport size={60} className="car-icon" />
                <span className="car-label">
                  {vehicle.name.split(" ")[1]} {vehicle.name.split(" ")[2]}
                </span>
              </div>

              <div className="vehicle-info">
                <h2>{vehicle.name}</h2>
                <p className="vehicle-plate">{vehicle.plate}</p>
                <p className="vehicle-type">{vehicle.type}</p>
                <div className={`vehicle-status ${vehicle.status}`}>
                  <span className="status-dot"></span>
                  {vehicle.status === "active"
                    ? "ACTIVE"
                    : vehicle.status === "pending"
                    ? "PENDING APPROVAL"
                    : "INACTIVE"}
                </div>
              </div>

              <button
                className="more-btn"
                onClick={(e) => handleMoreClick(e, vehicle)}
              >
                <IoEllipsisVertical size={16} />
              </button>
            </div>
          ))}
        </div>

        <button className="add-vehicle-btn">
          <IoAdd size={20} />
          Add new vehicle
        </button>

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

      {showOptionsModal && selectedVehicle && (
        <VehicleOptionsModal
          vehicle={selectedVehicle}
          onClose={() => setShowOptionsModal(false)}
          onViewDocuments={handleViewDocuments}
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

// Main App Component - Controls routing between the two pages
const VehicleApp = () => {
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

export default VehicleApp;

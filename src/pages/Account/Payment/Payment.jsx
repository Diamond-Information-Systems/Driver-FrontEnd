import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoChevronBack,
  IoChevronForward,
  IoCard,
  IoWallet,
  IoPhonePortrait,
  IoStar,
  IoCreate,
  IoAddCircle,
  IoBusinessOutline,
  IoAdd,
} from "react-icons/io5";
import { BsBank } from "react-icons/bs";
import "./Payment.css";

// Mobile Money Detail Component
const MobileMoneyDetail = ({ account, onBack, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    provider: account.provider,
    phoneNumber: account.phoneNumber,
    accountHolderName: account.accountHolderName,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving mobile money details:", formData);
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (
      window.confirm(
        "Are you sure you want to remove this mobile money account?"
      )
    ) {
      onRemove(account.id);
      onBack();
    }
  };

  if (isEditing) {
    return (
      <div className="vaye-payment-page">
        <header className="vaye-payment-header">
          <button
            className="vaye-payment-back-btn"
            onClick={() => setIsEditing(false)}
          >
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-payment-title">Edit Mobile Money</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-payment-content full-width">
          <form className="vaye-payment-form full-width">
            <div className="vaye-form-group">
              <label className="vaye-form-label">Provider</label>
              <select
                className="vaye-form-select"
                value={formData.provider}
                onChange={(e) => handleInputChange("provider", e.target.value)}
              >
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Vodacom M-Pesa">Vodacom M-Pesa</option>
                <option value="Cell C Pay">Cell C Pay</option>
                <option value="Telkom Pay">Telkom Pay</option>
              </select>
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Account Holder Name</label>
              <input
                type="text"
                className="vaye-form-input"
                value={formData.accountHolderName}
                onChange={(e) =>
                  handleInputChange("accountHolderName", e.target.value)
                }
              />
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Phone Number</label>
              <input
                type="tel"
                className="vaye-form-input"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <button
                type="button"
                className="vaye-payment-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="vaye-payment-button secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vaye-payment-page">
      <header className="vaye-payment-header">
        <button className="vaye-payment-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-payment-title">{account.provider}</h1>
        <div className="vaye-payment-icon">
          <IoPhonePortrait size={24} />
        </div>
      </header>

      <div className="vaye-payment-content">
        <div className="vaye-bank-detail">
          <div className="vaye-bank-header">
            <div className="vaye-bank-icon-large mobile">
              <IoPhonePortrait />
            </div>
            <div className="vaye-bank-info">
              <h2>{account.provider}</h2>
              <div className="vaye-bank-account-number">
                {account.phoneNumber}
              </div>
            </div>
          </div>

          <button
            className="vaye-edit-button"
            onClick={() => setIsEditing(true)}
          >
            <IoCreate className="vaye-edit-button-icon" />
            <span className="vaye-edit-button-text">Edit</span>
          </button>

          <button
            className="vaye-payment-button secondary"
            onClick={handleRemove}
            style={{ marginTop: "16px" }}
          >
            Remove Mobile Money Account
          </button>
        </div>
      </div>
    </div>
  );
};

// E-Wallet Detail Component
const EWalletDetail = ({ account, onBack, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    walletProvider: account.walletProvider,
    walletId: account.walletId,
    accountHolderName: account.accountHolderName,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving e-wallet details:", formData);
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (
      window.confirm(
        `Are you sure you want to remove this ${account.walletProvider} account?`
      )
    ) {
      onRemove(account.id);
      onBack();
    }
  };

  if (isEditing) {
    return (
      <div className="vaye-payment-page">
        <header className="vaye-payment-header">
          <button
            className="vaye-payment-back-btn"
            onClick={() => setIsEditing(false)}
          >
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-payment-title">Edit E-Wallet</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-payment-content full-width">
          <form className="vaye-payment-form full-width">
            <div className="vaye-form-group">
              <label className="vaye-form-label">Wallet Provider</label>
              <select
                className="vaye-form-select"
                value={formData.walletProvider}
                onChange={(e) =>
                  handleInputChange("walletProvider", e.target.value)
                }
              >
                <option value="SmileCash">SmileCash</option>
                <option value="PayPal">PayPal</option>
                <option value="Skrill">Skrill</option>
                <option value="Payoneer">Payoneer</option>
              </select>
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Account Holder Name</label>
              <input
                type="text"
                className="vaye-form-input"
                value={formData.accountHolderName}
                onChange={(e) =>
                  handleInputChange("accountHolderName", e.target.value)
                }
              />
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">
                {formData.walletProvider === "SmileCash"
                  ? "Phone Number"
                  : "Wallet ID/Email"}
              </label>
              <input
                type={formData.walletProvider === "SmileCash" ? "tel" : "text"}
                className="vaye-form-input"
                value={formData.walletId}
                onChange={(e) => handleInputChange("walletId", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <button
                type="button"
                className="vaye-payment-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="vaye-payment-button secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vaye-payment-page">
      <header className="vaye-payment-header">
        <button className="vaye-payment-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-payment-title">{account.walletProvider}</h1>
        <div className="vaye-payment-icon">
          <IoWallet size={24} />
        </div>
      </header>

      <div className="vaye-payment-content">
        <div className="vaye-bank-detail">
          <div className="vaye-bank-header">
            <div className="vaye-bank-icon-large wallet">
              <IoWallet />
            </div>
            <div className="vaye-bank-info">
              <h2>{account.walletProvider}</h2>
              <div className="vaye-bank-account-number">{account.walletId}</div>
            </div>
          </div>

          <button
            className="vaye-edit-button"
            onClick={() => setIsEditing(true)}
          >
            <IoCreate className="vaye-edit-button-icon" />
            <span className="vaye-edit-button-text">Edit</span>
          </button>

          <button
            className="vaye-payment-button secondary"
            onClick={handleRemove}
            style={{ marginTop: "16px" }}
          >
            Remove {account.walletProvider} Account
          </button>
        </div>
      </div>
    </div>
  );
};
// Bank Account Detail Component
const BankAccountDetail = ({ account, onBack, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountType: account.accountType || "checking",
    accountHolderName: account.accountHolderName || "Nhlamulo Chauke",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Handle saving the updated account details
    console.log("Saving account details:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType || "checking",
      accountHolderName: account.accountHolderName || "Nhlamulo Chauke",
    });
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (account.isDefault) {
      alert(
        "You can't remove your default payout account. Please set another account as default first."
      );
      return;
    }
    if (window.confirm("Are you sure you want to remove this bank account?")) {
      onRemove(account.id);
      onBack();
    }
  };

  if (isEditing) {
    return (
      <div className="vaye-payment-page">
        <header className="vaye-payment-header">
          <button className="vaye-payment-back-btn" onClick={handleCancel}>
            <IoChevronBack size={24} />
          </button>
          <h1 className="vaye-payment-title">Edit Bank Account</h1>
          <div style={{ width: "48px" }}></div>
        </header>

        <div className="vaye-payment-content full-width">
          <form className="vaye-payment-form full-width">
            <div className="vaye-form-group">
              <label className="vaye-form-label">Bank Name</label>
              <input
                type="text"
                className="vaye-form-input"
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                placeholder="Enter bank name"
              />
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Account Holder Name</label>
              <input
                type="text"
                className="vaye-form-input"
                value={formData.accountHolderName}
                onChange={(e) =>
                  handleInputChange("accountHolderName", e.target.value)
                }
                placeholder="Enter account holder name"
              />
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Account Number</label>
              <input
                type="text"
                className="vaye-form-input"
                value={formData.accountNumber}
                onChange={(e) =>
                  handleInputChange("accountNumber", e.target.value)
                }
                placeholder="Enter account number"
              />
            </div>

            <div className="vaye-form-group">
              <label className="vaye-form-label">Account Type</label>
              <select
                className="vaye-form-select"
                value={formData.accountType}
                onChange={(e) =>
                  handleInputChange("accountType", e.target.value)
                }
              >
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Account</option>
                <option value="business">Business Account</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
              <button
                type="button"
                className="vaye-payment-button"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="vaye-payment-button secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vaye-payment-page">
      <header className="vaye-payment-header">
        <button className="vaye-payment-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-payment-title">{account.bankName}</h1>
        <div className="vaye-payment-icon">
          <IoCard size={24} />
        </div>
      </header>

      <div className="vaye-payment-content">
        <div className="vaye-bank-detail">
          <div className="vaye-bank-header">
            <div className="vaye-bank-icon-large">
              <BsBank />
            </div>
            <div className="vaye-bank-info">
              <h2>{account.bankName}</h2>
              <div className="vaye-bank-account-number">
                ••••••••{account.accountNumber.slice(-2)}
              </div>
            </div>
          </div>

          {account.isDefault && (
            <div className="vaye-status-badge default">
              <IoStar className="vaye-status-badge-icon" />
              <span className="vaye-status-badge-text">
                Default for weekly payout
              </span>
            </div>
          )}

          <button
            className="vaye-edit-button"
            onClick={() => setIsEditing(true)}
          >
            <IoCreate className="vaye-edit-button-icon" />
            <span className="vaye-edit-button-text">Edit</span>
          </button>

          {account.isDefault ? (
            <div className="vaye-warning-notice">
              This account can't be deleted because you need an account for your
              cashouts. Tap "Edit" to replace the details instead.
            </div>
          ) : (
            <button
              className="vaye-payment-button secondary"
              onClick={handleRemove}
              style={{ marginTop: "16px" }}
            >
              Remove Bank Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Payment Method Component
const AddPaymentMethod = ({ onBack, onAddMethod }) => {
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    // Bank Account Fields
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    branchCode: "",

    // Mobile Money Fields
    phoneNumber: "",
    provider: "",

    // E-Wallet Fields
    walletId: "",
    walletProvider: "",
  });

  const paymentTypes = [
    {
      id: "bank",
      title: "Bank Account",
      description: "Add your bank account for weekly payouts",
      icon: <IoCard size={24} />,
      iconClass: "",
    },
    {
      id: "mobile",
      title: "Mobile Money",
      description: "MTN Mobile Money, Vodacom M-Pesa, etc.",
      icon: <IoPhonePortrait size={24} />,
      iconClass: "mobile",
    },
    {
      id: "wallet",
      title: "E-Wallet",
      description: "SmileCash, PayPal, or other digital wallets",
      icon: <IoWallet size={24} />,
      iconClass: "wallet",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newMethod = {};

    if (selectedType === "bank") {
      newMethod = {
        id: Date.now(),
        type: "bank",
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        description: `Earnings paid out weekly`,
        isDefault: false,
      };
    } else if (selectedType === "mobile") {
      newMethod = {
        id: Date.now(),
        type: "mobile",
        provider: formData.provider,
        phoneNumber: formData.phoneNumber,
        accountHolderName: formData.accountHolderName || "Nhlamulo Chauke",
        description: `Mobile money account`,
        isDefault: false,
      };
    } else if (selectedType === "wallet") {
      newMethod = {
        id: Date.now(),
        type: "wallet",
        walletProvider: formData.walletProvider,
        walletId: formData.walletId,
        accountHolderName: formData.accountHolderName || "Nhlamulo Chauke",
        description: `Digital wallet account`,
        isDefault: false,
      };
    }

    onAddMethod(newMethod);
    onBack();
  };

  const renderTypeSelection = () => (
    <div className="vaye-payment-content">
      <div className="vaye-payment-section">
        <h2 className="vaye-payment-section-title">Add Payment Method</h2>
        <p
          style={{
            fontSize: "16px",
            color: "var(--vaye-text-secondary)",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Choose how you'd like to receive your earnings
        </p>

        {paymentTypes.map((type) => (
          <div
            key={type.id}
            className="vaye-payment-method-card"
            onClick={() => setSelectedType(type.id)}
          >
            <div className="vaye-payment-method-content">
              <div className={`vaye-payment-icon ${type.iconClass}`}>
                {type.icon}
              </div>
              <div className="vaye-payment-details">
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>
            </div>
            <IoChevronForward className="vaye-payment-chevron" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderBankForm = () => (
    <div className="vaye-payment-content">
      <h2 className="vaye-payment-section-title">Add Bank Account</h2>

      <form onSubmit={handleSubmit} className="vaye-payment-form">
        <div className="vaye-form-group">
          <label className="vaye-form-label">Bank Name</label>
          <select
            className="vaye-form-select"
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            required
          >
            <option value="">Select your bank</option>
            <option value="Capitec Bank">Capitec Bank</option>
            <option value="Standard Bank">Standard Bank</option>
            <option value="FNB">First National Bank (FNB)</option>
            <option value="Absa">Absa</option>
            <option value="Nedbank">Nedbank</option>
            <option value="African Bank">African Bank</option>
            <option value="Discovery Bank">Discovery Bank</option>
          </select>
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Account Holder Name</label>
          <input
            type="text"
            className="vaye-form-input"
            value={formData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
            placeholder="Full name as per bank records"
            required
          />
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Account Number</label>
          <input
            type="text"
            className="vaye-form-input"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            placeholder="Enter your account number"
            required
          />
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Branch Code</label>
          <input
            type="text"
            className="vaye-form-input"
            value={formData.branchCode}
            onChange={(e) => handleInputChange("branchCode", e.target.value)}
            placeholder="6-digit branch code"
          />
        </div>

        <button type="submit" className="vaye-payment-button">
          <IoAddCircle size={20} />
          Add Bank Account
        </button>
      </form>
    </div>
  );

  const renderMobileForm = () => (
    <div className="vaye-payment-content">
      <h2 className="vaye-payment-section-title">Add Mobile Money</h2>

      <form onSubmit={handleSubmit} className="vaye-payment-form">
        <div className="vaye-form-group">
          <label className="vaye-form-label">Mobile Money Provider</label>
          <select
            className="vaye-form-select"
            value={formData.provider}
            onChange={(e) => handleInputChange("provider", e.target.value)}
            required
          >
            <option value="">Select provider</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Vodacom M-Pesa">Vodacom M-Pesa</option>
            <option value="Cell C Pay">Cell C Pay</option>
            <option value="Telkom Pay">Telkom Pay</option>
          </select>
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Account Holder Name</label>
          <input
            type="text"
            className="vaye-form-input"
            value={formData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
            placeholder="Name as registered with provider"
            required
          />
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Phone Number</label>
          <input
            type="tel"
            className="vaye-form-input"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            placeholder="+27 XX XXX XXXX"
            required
          />
        </div>

        <button type="submit" className="vaye-payment-button">
          <IoAddCircle size={20} />
          Add Mobile Money
        </button>
      </form>
    </div>
  );

  const renderWalletForm = () => (
    <div className="vaye-payment-content">
      <h2 className="vaye-payment-section-title">Add E-Wallet</h2>

      <form onSubmit={handleSubmit} className="vaye-payment-form">
        <div className="vaye-form-group">
          <label className="vaye-form-label">Wallet Provider</label>
          <select
            className="vaye-form-select"
            value={formData.walletProvider}
            onChange={(e) =>
              handleInputChange("walletProvider", e.target.value)
            }
            required
          >
            <option value="">Select wallet provider</option>
            <option value="SmileCash">SmileCash</option>
            <option value="PayPal">PayPal</option>
            <option value="Skrill">Skrill</option>
            <option value="Payoneer">Payoneer</option>
            <option value="Perfect Money">Perfect Money</option>
          </select>
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">Account Holder Name</label>
          <input
            type="text"
            className="vaye-form-input"
            value={formData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
            placeholder="Name as registered with wallet"
            required
          />
        </div>

        <div className="vaye-form-group">
          <label className="vaye-form-label">
            {formData.walletProvider === "SmileCash"
              ? "Phone Number"
              : "Wallet ID/Email"}
          </label>
          <input
            type={formData.walletProvider === "SmileCash" ? "tel" : "text"}
            className="vaye-form-input"
            value={formData.walletId}
            onChange={(e) => handleInputChange("walletId", e.target.value)}
            placeholder={
              formData.walletProvider === "SmileCash"
                ? "+27 XX XXX XXXX"
                : "Enter wallet ID or email"
            }
            required
          />
        </div>

        <button type="submit" className="vaye-payment-button">
          <IoAddCircle size={20} />
          Add E-Wallet
        </button>
      </form>
    </div>
  );

  return (
    <div className="vaye-payment-page">
      <header className="vaye-payment-header">
        <button className="vaye-payment-back-btn" onClick={onBack}>
          <IoChevronBack size={24} />
        </button>
        <h1 className="vaye-payment-title">
          {selectedType === "bank"
            ? "Add Bank Account"
            : selectedType === "mobile"
            ? "Add Mobile Money"
            : selectedType === "wallet"
            ? "Add E-Wallet"
            : "Add Payment Method"}
        </h1>
        <div style={{ width: "48px" }}></div>
      </header>

      {!selectedType && renderTypeSelection()}
      {selectedType === "bank" && renderBankForm()}
      {selectedType === "mobile" && renderMobileForm()}
      {selectedType === "wallet" && renderWalletForm()}
    </div>
  );
};

// Main Payments Component
const PaymentManagement = ({ onBack }) => {
  const navigate = useNavigate(); // Add this hook
  const [currentPage, setCurrentPage] = useState("main");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "bank",
      bankName: "Capitec Bank",
      accountNumber: "XXXXXXXX50",
      accountHolderName: "Nhlamulo Chauke",
      description: "Earnings paid out weekly",
      isDefault: true,
    },
    {
      id: 2,
      type: "wallet",
      walletProvider: "SmileCash",
      walletId: "+27 XX XXX XXXX",
      accountHolderName: "Nhlamulo Chauke",
      description: "Digital wallet payments",
      isDefault: false,
    },
    {
      id: 3,
      type: "wallet",
      walletProvider: "PayPal",
      walletId: "nhlamulo@example.com",
      accountHolderName: "Nhlamulo Chauke",
      description: "International payments",
      isDefault: false,
    },
    {
      id: 4,
      type: "mobile",
      provider: "MTN Mobile Money",
      phoneNumber: "+27 XX XXX XXXX",
      accountHolderName: "Nhlamulo Chauke",
      description: "Mobile money account",
      isDefault: false,
    },
  ]);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setCurrentPage("detail");
  };

  const handleBackToMain = () => {
    setCurrentPage("main");
    setSelectedAccount(null);
  };

  const handleBackToParent = () => {
    if (onBack) {
      onBack(); // Use parent's navigation if provided
    } else {
      navigate(-1); // Go back in browser history
      // Or navigate to specific route: navigate('/dashboard')
    }
  };
  const handleAddPaymentMethod = () => {
    setCurrentPage("add");
  };

  const handleAddMethod = (newMethod) => {
    setPaymentMethods((prev) => [...prev, newMethod]);
  };

  const handleRemoveMethod = (methodId) => {
    setPaymentMethods((prev) =>
      prev.filter((method) => method.id !== methodId)
    );
  };

  const renderAccountDetail = (account) => {
    switch (account.type) {
      case "bank":
        return (
          <BankAccountDetail
            account={account}
            onBack={handleBackToMain}
            onRemove={handleRemoveMethod}
          />
        );
      case "mobile":
        return (
          <MobileMoneyDetail
            account={account}
            onBack={handleBackToMain}
            onRemove={handleRemoveMethod}
          />
        );
      case "wallet":
        return (
          <EWalletDetail
            account={account}
            onBack={handleBackToMain}
            onRemove={handleRemoveMethod}
          />
        );
      default:
        return (
          <BankAccountDetail
            account={account}
            onBack={handleBackToMain}
            onRemove={handleRemoveMethod}
          />
        );
    }
  };

  const getPaymentIcon = (method) => {
    switch (method.type) {
      case "bank":
        return <IoCard size={20} />;
      case "mobile":
        return <IoPhonePortrait size={20} />;
      case "wallet":
        return <IoWallet size={20} />;
      default:
        return <IoBusinessOutline size={20} />;
    }
  };

  const getPaymentTitle = (method) => {
    switch (method.type) {
      case "bank":
        return `Bank account - ${method.accountNumber}`;
      case "mobile":
        return `${method.provider}`;
      case "wallet":
        if (method.walletProvider === "SmileCash") {
          return `${method.walletProvider} - ${method.walletId}`;
        }
        return `${method.walletProvider}`;
      default:
        return "Payment Method";
    }
  };

  const getPaymentDescription = (method) => {
    switch (method.type) {
      case "bank":
        return method.description;
      case "mobile":
        return method.phoneNumber;
      case "wallet":
        if (method.walletProvider === "SmileCash") {
          return method.accountHolderName;
        }
        return method.walletId;
      default:
        return method.accountHolderName;
    }
  };

  const getPaymentIconClass = (method) => {
    switch (method.type) {
      case "mobile":
        return "mobile";
      case "wallet":
        return "wallet";
      default:
        return "";
    }
  };

  // Render different pages based on current state
  switch (currentPage) {
    case "detail":
      return renderAccountDetail(selectedAccount);
    case "add":
      return (
        <AddPaymentMethod
          onBack={handleBackToMain}
          onAddMethod={handleAddMethod}
        />
      );
    default:
      return (
        <div className="vaye-payment-page">
          <header className="vaye-payment-header">
            <button className="vaye-payment-back-btn" onClick={handleBackToParent}>
              <IoChevronBack size={24} />
            </button>
            <h1 className="vaye-payment-title">Payments</h1>
            <div style={{ width: "48px" }}></div>
          </header>

          <div className="vaye-payment-content">
            {/* Payout Section */}
            <div className="vaye-payment-section">
              <h2 className="vaye-payment-section-title">Payout</h2>

              {paymentMethods
                .filter((method) => method.isDefault)
                .map((method) => (
                  <div
                    key={method.id}
                    className="vaye-payment-method-card"
                    onClick={() => handleAccountClick(method)}
                  >
                    <div className="vaye-payment-method-content">
                      <div
                        className={`vaye-payment-icon ${getPaymentIconClass(
                          method
                        )}`}
                      >
                        {getPaymentIcon(method)}
                      </div>
                      <div className="vaye-payment-details">
                        <h3>{getPaymentTitle(method)}</h3>
                        <p>{method.description}</p>
                      </div>
                    </div>
                    <IoChevronForward className="vaye-payment-chevron" />
                  </div>
                ))}

              <div className="vaye-info-section">
                <p>
                  A week runs from Monday at 4:00 a.m. to the following Monday
                  at 3:59 a.m. All trips during that time period will count
                  towards that week's earnings period.
                </p>
                <a href="#" style={{ color: "var(--vaye-primary-navy)" }}>
                  Learn more
                </a>
              </div>
            </div>

            {/* Linked Payment Methods Section */}
            <div className="vaye-payment-section">
              <h2 className="vaye-payment-section-subtitle">
                Linked payment methods
              </h2>

              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="vaye-payment-method-card"
                  onClick={() => handleAccountClick(method)}
                >
                  <div className="vaye-payment-method-content">
                    <div
                      className={`vaye-payment-icon ${getPaymentIconClass(
                        method
                      )}`}
                    >
                      {getPaymentIcon(method)}
                    </div>
                    <div className="vaye-payment-details">
                      <h3>{getPaymentTitle(method)}</h3>
                      <p>{getPaymentDescription(method)}</p>
                    </div>
                  </div>
                  <IoChevronForward className="vaye-payment-chevron" />
                </div>
              ))}

              <button
                className="vaye-add-payment-btn"
                onClick={handleAddPaymentMethod}
              >
                <IoAddCircle size={20} />
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      );
  }
};

export default PaymentManagement;

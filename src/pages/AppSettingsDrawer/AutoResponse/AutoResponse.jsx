import React, { useState } from 'react';
import { ChevronLeft, Edit3, Clock, MapPin, Play, CheckCircle, XCircle } from 'lucide-react';
import './AutoResponse.css';

const AutoResponseTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 'trip-accepted',
      title: 'Trip Accepted',
      description: 'Sent when you accept a trip request',
      icon: <CheckCircle size={20} />,
      enabled: true,
      message: "Hello! I've accepted your trip and I'm on my way to pick you up."
    },
    {
      id: 'arrived-pickup',
      title: 'Arrived at Pickup',
      description: 'Sent when you arrive at pickup location',
      icon: <MapPin size={20} />,
      enabled: true,
      message: "I've arrived at your pickup location. Please come out when you're ready."
    },
    {
      id: 'trip-started',
      title: 'Trip Started',
      description: 'Sent when the trip begins',
      icon: <Play size={20} />,
      enabled: false,
      message: "Trip started! Sit back and enjoy your ride."
    },
    {
      id: 'trip-completed',
      title: 'Trip Completed',
      description: 'Sent when the trip ends',
      icon: <CheckCircle size={20} />,
      enabled: true,
      message: "Trip completed. Thank you for riding with us! Have a great day."
    },
    {
      id: 'trip-cancelled',
      title: 'Trip Cancelled',
      description: 'Sent when you cancel a trip',
      icon: <XCircle size={20} />,
      enabled: false,
      message: "Sorry, I had to cancel the trip due to unforeseen circumstances. Please book another ride."
    },
    {
      id: 'running-late',
      title: 'Running Late',
      description: 'Sent when you are delayed',
      icon: <Clock size={20} />,
      enabled: true,
      message: "I'm running about 5 minutes late due to traffic. Thank you for your patience!"
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');

  const handleBack = () => {
    window.history.back();
  };

  const toggleTemplate = (id) => {
    setTemplates(templates.map(template => 
      template.id === id 
        ? { ...template, enabled: !template.enabled }
        : template
    ));
  };

  const startEditing = (id, currentMessage) => {
    setEditingId(id);
    setEditMessage(currentMessage);
  };

  const saveMessage = (id) => {
    setTemplates(templates.map(template => 
      template.id === id 
        ? { ...template, message: editMessage }
        : template
    ));
    setEditingId(null);
    setEditMessage('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditMessage('');
  };

  const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? 'on' : 'off'}`} onClick={onToggle}>
      <div className="toggle-slider"></div>
    </div>
  );

  return (
    <div className="auto-response-templates-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Auto-Response Templates</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Description */}
        <div className="description">
          Configure automatic messages that will be sent to riders when specific events occur during your trips.
        </div>

        {/* Templates List */}
        <div className="templates-section">
          <div className="templates-list">
            {templates.map((template) => (
              <div key={template.id} className="template-item">
                <div className="template-header">
                  <div className="template-info">
                    <div className="template-icon">
                      {template.icon}
                    </div>
                    <div className="template-details">
                      <div className="template-title">{template.title}</div>
                      <div className="template-description">{template.description}</div>
                    </div>
                  </div>
                  <div className="template-controls">
                    <button 
                      className="edit-button"
                      onClick={() => startEditing(template.id, template.message)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <ToggleSwitch 
                      isOn={template.enabled}
                      onToggle={() => toggleTemplate(template.id)}
                    />
                  </div>
                </div>

                {editingId === template.id ? (
                  <div className="edit-section">
                    <div className="edit-label">Edit Message</div>
                    <textarea
                      className="edit-textarea"
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={3}
                      maxLength={300}
                      placeholder="Enter your auto-response message..."
                    />
                    <div className="character-count">
                      {editMessage.length}/300
                    </div>
                    <div className="edit-actions">
                      <button 
                        className="cancel-button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-button"
                        onClick={() => saveMessage(template.id)}
                        disabled={!editMessage.trim()}
                      >
                        Save Message
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="message-preview">
                    <div className="preview-label">Current Message:</div>
                    <div className="preview-text">{template.message}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-text">
            💡 Auto-responses help maintain professional communication with riders. You can enable/disable each template and customize the messages to match your style.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoResponseTemplates;
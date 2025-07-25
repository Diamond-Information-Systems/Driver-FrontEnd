import React, { useState } from 'react';
import { ChevronLeft, Plus, Edit3, Trash2, GripVertical } from 'lucide-react';
import './QuickResponse.css';

const QuickResponses = () => {
  const [responses, setResponses] = useState([
    { id: 1, text: "On my way to pickup location" },
    { id: 2, text: "I've arrived at your pickup location" },
    { id: 3, text: "Running 5 minutes late due to traffic" },
    { id: 4, text: "Please wait, looking for parking" },
    { id: 5, text: "Trip completed, thank you for riding!" },
    { id: 6, text: "Please come to the main road" }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newResponseText, setNewResponseText] = useState('');

  const handleBack = () => {
    window.history.back();
  };

  const handleAddResponse = () => {
    if (newResponseText.trim()) {
      const newResponse = {
        id: Math.max(...responses.map(r => r.id)) + 1,
        text: newResponseText.trim()
      };
      setResponses([...responses, newResponse]);
      setNewResponseText('');
      setShowAddForm(false);
    }
  };

  const handleEditResponse = (id, newText) => {
    setResponses(responses.map(r => 
      r.id === id ? { ...r, text: newText } : r
    ));
    setEditingId(null);
  };

  const handleDeleteResponse = (id) => {
    setResponses(responses.filter(r => r.id !== id));
  };

  const startEditing = (id, currentText) => {
    setEditingId(id);
    setNewResponseText(currentText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewResponseText('');
  };

  return (
    <div className="quick-responses-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="header-title">Quick Responses</h1>
      </header>

      {/* Content */}
      <div className="content">
        {/* Description */}
        <div className="description">
          Create and manage pre-written messages to send to riders quickly during trips.
        </div>

        {/* Add New Response Button */}
        <div className="add-section">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Add New Response
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="add-form">
            <div className="form-group">
              <label className="form-label">New Response Message</label>
              <textarea
                className="form-textarea"
                value={newResponseText}
                onChange={(e) => setNewResponseText(e.target.value)}
                placeholder="Enter your quick response message..."
                rows={3}
                maxLength={200}
              />
              <div className="character-count">
                {newResponseText.length}/200
              </div>
            </div>
            <div className="form-actions">
              <button 
                className="cancel-button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewResponseText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={handleAddResponse}
                disabled={!newResponseText.trim()}
              >
                Add Response
              </button>
            </div>
          </div>
        )}

        {/* Responses List */}
        <div className="responses-section">
          <div className="section-title">Your Quick Responses</div>
          
          <div className="responses-list">
            {responses.map((response) => (
              <div key={response.id} className="response-item">
                <div className="response-drag">
                  <GripVertical size={16} />
                </div>
                
                {editingId === response.id ? (
                  <div className="edit-form">
                    <textarea
                      className="edit-textarea"
                      value={newResponseText}
                      onChange={(e) => setNewResponseText(e.target.value)}
                      rows={2}
                      maxLength={200}
                    />
                    <div className="character-count">
                      {newResponseText.length}/200
                    </div>
                    <div className="edit-actions">
                      <button 
                        className="cancel-button small"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-button small"
                        onClick={() => handleEditResponse(response.id, newResponseText)}
                        disabled={!newResponseText.trim()}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="response-content">
                      <div className="response-text">{response.text}</div>
                    </div>
                    
                    <div className="response-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => startEditing(response.id, response.text)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteResponse(response.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="tip-section">
          <div className="tip-text">
            💡 Tip: Keep your responses short and clear. You can reorder them by dragging the grip handle.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickResponses;
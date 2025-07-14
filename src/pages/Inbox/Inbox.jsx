import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Plus,
  Smile,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  Flag,
  Shield,
  Car,
  MapPin,
  DollarSign,
} from "lucide-react";
import BottomDock from "../../components/BottomDock";
import "./Inbox.css";

const Inbox = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Sample chat data - replace with real data
  const chats = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Thanks for the smooth ride! 5 stars ⭐",
      time: "2m ago",
      unread: 2,
      online: true,
      type: "passenger",
      tripId: "VY-2024-001",
      tripStatus: "completed",
      rating: 5,
      amount: "R85.50"
    },
    {
      id: 2,
      name: "Vaye Support",
      lastMessage: "Your weekly earnings report is ready to view",
      time: "1h ago",
      unread: 0,
      online: false,
      type: "support",
      official: true
    },
    {
      id: 3,
      name: "Michael Chen",
      lastMessage: "Running 5 minutes late, almost there!",
      time: "3h ago",
      unread: 0,
      online: false,
      type: "passenger",
      tripId: "VY-2024-002",
      tripStatus: "active",
      pickup: "Sandton City",
      dropoff: "OR Tambo Airport"
    },
    {
      id: 4,
      name: "Priya Patel",
      lastMessage: "Could you please wait 2 minutes? Just finishing up",
      time: "Yesterday",
      unread: 0,
      online: false,
      type: "passenger",
      tripId: "VY-2024-003",
      tripStatus: "completed",
      rating: 4,
      amount: "R127.30"
    },
    {
      id: 5,
      name: "Vaye Team",
      lastMessage: "Congratulations! You've achieved Gold status 🎉",
      time: "2 days ago",
      unread: 0,
      online: false,
      type: "notification",
      official: true
    }
  ];

  // Sample messages for selected chat
  const getMessages = (chatId) => {
    const messageData = {
      1: [
        { id: 1, text: "Hi! I'm on my way to pick you up", sender: "me", time: "14:30", status: "read" },
        { id: 2, text: "Great! I'm waiting at the main entrance", sender: "them", time: "14:31" },
        { id: 3, text: "I can see you, I'm in the blue Toyota", sender: "me", time: "14:32", status: "read" },
        { id: 4, text: "Perfect, coming now!", sender: "them", time: "14:32" },
        { id: 5, text: "Thanks for the smooth ride! 5 stars ⭐", sender: "them", time: "15:15" },
      ],
      3: [
        { id: 1, text: "Hi! I'm your Vaye driver for today", sender: "me", time: "12:00", status: "read" },
        { id: 2, text: "Hello! How long until you arrive?", sender: "them", time: "12:01" },
        { id: 3, text: "I'm about 8 minutes away", sender: "me", time: "12:02", status: "read" },
        { id: 4, text: "Running 5 minutes late, almost there!", sender: "them", time: "12:15" },
      ]
    };
    return messageData[chatId] || [];
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderChatList = () => (
    <div className="inbox-container">
      {/* Search Header */}
      <div className="inbox-header">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? "active" : ""}`}
            onClick={() => setSelectedChat(chat)}
          >
            <div className="chat-avatar-container">
              <div className={`chat-avatar-placeholder ${chat.official ? "official" : ""}`}>
                {chat.official ? "V" : getInitials(chat.name)}
              </div>
              {chat.online && <div className="online-indicator" />}
            </div>

            <div className="chat-content">
              <div className="chat-header-row">
                <h3 className="chat-name">{chat.name}</h3>
                <div className="chat-meta">
                  {chat.tripId && (
                    <span className="trip-id">{chat.tripId}</span>
                  )}
                  <span className="chat-time">{chat.time}</span>
                </div>
              </div>

              <div className="chat-last-message">
                <p className={chat.unread > 0 ? "unread" : ""}>{chat.lastMessage}</p>
                <div className="chat-indicators">
                  {chat.amount && (
                    <span className="trip-amount">{chat.amount}</span>
                  )}
                  {chat.rating && (
                    <div className="rating-badge">
                      <Star size={10} fill="currentColor" />
                      <span>{chat.rating}</span>
                    </div>
                  )}
                  {chat.unread > 0 && (
                    <div className="unread-badge">{chat.unread}</div>
                  )}
                </div>
              </div>

              {chat.tripStatus === "active" && (
                <div className="trip-info">
                  <div className="route-info">
                    <MapPin size={10} />
                    <span>{chat.pickup} → {chat.dropoff}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatView = () => {
    const messages = getMessages(selectedChat.id);
    
    return (
      <div className="chat-view">
        {/* Chat Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => setSelectedChat(null)}>
            <ArrowLeft size={20} />
          </button>
          
          <div className="chat-header-info">
            <div className="chat-avatar-container">
              <div className={`chat-avatar-placeholder ${selectedChat.official ? "official" : ""}`}>
                {selectedChat.official ? "V" : getInitials(selectedChat.name)}
              </div>
              {selectedChat.online && <div className="online-indicator" />}
            </div>
            
            <div className="header-text">
              <h2 className="chat-title">{selectedChat.name}</h2>
              {selectedChat.tripId && (
                <p className="trip-subtitle">Trip {selectedChat.tripId}</p>
              )}
              {selectedChat.online && (
                <p className="status-text">Online now</p>
              )}
            </div>
          </div>

          <div className="chat-actions">
            {selectedChat.type === "passenger" && (
              <>
                <button className="action-btn">
                  <Phone size={18} />
                </button>
                <button className="action-btn">
                  <Video size={18} />
                </button>
              </>
            )}
            <button className="action-btn">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Trip Status Card */}
        {selectedChat.tripStatus && (
          <div className={`trip-status-card ${selectedChat.tripStatus}`}>
            <div className="trip-status-content">
              {selectedChat.tripStatus === "active" ? (
                <>
                  <Car size={16} />
                  <div>
                    <p className="status-title">Trip in Progress</p>
                    <p className="status-subtitle">{selectedChat.pickup} → {selectedChat.dropoff}</p>
                  </div>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <div>
                    <p className="status-title">Trip Completed</p>
                    <p className="status-subtitle">
                      {selectedChat.amount} • {selectedChat.rating} ⭐
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender === "me" ? "sent" : "received"}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                <div className="message-meta">
                  <span className="message-time">{msg.time}</span>
                  {msg.sender === "me" && msg.status && (
                    <div className={`message-status ${msg.status}`}>
                      {msg.status === "read" ? <CheckCheck size={12} /> : <Check size={12} />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          <div className="message-input-wrapper">
            <button className="attachment-btn">
              <Paperclip size={18} />
            </button>
            
            <div className="input-field">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="message-input"
              />
              <button className="emoji-btn">
                <Smile size={18} />
              </button>
            </div>
            
            <button 
              className={`send-btn ${message.trim() ? "active" : ""}`}
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inbox-page">
      {selectedChat ? renderChatView() : renderChatList()}
      <BottomDock activeTab="inbox" />
    </div>
  );
};

export default Inbox;
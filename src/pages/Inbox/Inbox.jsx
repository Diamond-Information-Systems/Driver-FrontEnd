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
import { useAuth } from "../../context/AuthContext";
import RideRequest from "../../components/RideRequest";

const socket = io("http://localhost:5001");

const Inbox = ({ driverId }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/drivers/${user._id}/clients`);
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.role === "driver") {
      fetchClients();
    }
  }, [user]);


  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (user?._id) {
      socket.emit('join', { userId: user._id });
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      console.log("📥 New message received:", msg);
      if (msg.sender === selectedChat?._id || msg.receiver === selectedChat?._id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: user._id,
      receiver: selectedChat._id,
      content: message.trim(),
    };

    socket.emit('send_message', newMessage);
    setMessages(prev => [...prev, { ...newMessage, sender: "me", time: new Date().toLocaleTimeString() }]);
      setMessage("");
    scrollToBottom();
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

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/messages/${user._id}/${selectedChat._id}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
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
            {/* same code... */}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatView = () => (
      <div className="chat-view">
      {/* Header & Trip Info... */}

        {/* Messages */}
        <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender === user._id ? "sent" : "received"}`}>
              <div className="message-content">
              <p>{msg.content}</p>
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

  return (
    <div className="inbox-page">
      {selectedChat ? renderChatView() : renderChatList()}
      <BottomDock activeTab="inbox" />
    </div>
  );
};

export default Inbox;

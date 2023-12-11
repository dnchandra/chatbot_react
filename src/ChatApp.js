import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatApp.css';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const botAvatar = 'bot-avatar.png';

  const sendMessage = async (text) => {
    if (!text.trim()) {
      return;
    }

    const userMessage = { text: text, user: 'user', name: 'User' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: text,
      });

      const botMessages = response.data.map((message) => {
        return {
          text: message.text,
          user: 'bot',
          buttons: message.buttons,
          custom: message.custom,
        };
      });

      setMessages((prevMessages) => [...prevMessages, ...botMessages]);
    } catch (error) {
      console.error('Error communicating with Rasa:', error);
      const errorMessage = { text: 'Error communicating with Rasa.', user: 'error', name: 'Error' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleButtonClick = (payload) => {
    setInput('');
    sendMessage(payload);
  };

  useEffect(() => {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(input);
      setInput('');
    }
  };

  const handleDropdownChange = (e) => {
    setInput(e.target.value);
  };

  const renderButtons = (buttons) => {
    return (
      <div className="button-container">
        {buttons.map((button, index) => (
          <button key={index} onClick={() => handleButtonClick(button.payload)}>
            {button.title}
          </button>
        ))}
      </div>
    );
  };

  const renderCustomMessages = (custom) => {
    if (custom && custom.payload === 'dropDown') {
      return (
        <div className="dropdown-container">
          <select onChange={handleDropdownChange}>
            <option value="">Select an option</option>
            {custom.data.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={() => handleButtonClick(input)}>Select</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chat-app">
      <div className="header">
        <h1>Hello .....Happy to Help!</h1>
      </div>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={msg.user === 'bot' ? 'bot-message' : 'user-message'}>
              {msg.user === 'bot' && <img className="avatar" src={botAvatar} alt="Bot Avatar" />}
              <div className="message-content">
                <span className="message-sender">{msg.name}: </span>
                {msg.text}
                {msg.buttons && renderButtons(msg.buttons)}
                {msg.custom && renderCustomMessages(msg.custom)}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={() => sendMessage(input)}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;

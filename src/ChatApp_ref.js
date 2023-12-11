import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatApp.css'; // Import the CSS file for styling

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const botAvatar = 'bot-avatar.png'; // Set the path to your bot's avatar image

  const sendMessage = async () => {
    if (!input.trim()) {
      // Don't send empty messages
      return;
    }

    const userMessage = { text: input, user: 'user', name: 'User' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      if (input.toLowerCase() === 'help') {
        const helpMessage = {
          text: 'I can help with below services! Please choose one.',
          user: 'bot',
          buttons: [
            { title: 'Application Services', payload: '/application_services' },
            { title: 'Infrastructure Services', payload: '/infrastructure_services' },
            { title: 'Management Services', payload: '/management_services' },
          ],
        };
        setMessages((prevMessages) => [...prevMessages, helpMessage]);
        return;
      }

      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: input,
      });

      const botReply = response.data[0]?.text || 'Sorry, I didn\'t understand that.';
      const botButtons = response.data[0]?.buttons || [];
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, user: 'bot', buttons: botButtons },
      ]);
    } catch (error) {
      console.error('Error communicating with Rasa:', error);
      const errorMessage = { text: 'Error communicating with Rasa.', user: 'error', name: 'Error' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleButtonClick = (payload) => {
    setInput(payload);
    switch (payload) {
      case '/application_services':
        handleApplicationServices();
        break;
      case '/infrastructure_services':
        handleInfrastructureServices();
        break;
      case '/management_services':
        handleManagementServices();
        break;
      default:
        sendMessage(payload);
    }
  };

  const renderDropdown = (options) => {
    return (
      <div className="dropdown-container">
        <select onChange={(e) => setInput(e.target.value)}>
          <option value="">Select a service</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button onClick={sendMessage}>Select</button>
      </div>
    );
  };
  
  const handleApplicationServices = () => {
    const applicationServicesMessage = {
      text: 'Please choose a service from the following options:',
      user: 'bot',
      options: ['app1service', 'app2service'],
      buttons: [
        { title: 'Documentation', payload: '/documentation' },
        { title: 'Access', payload: '/access' },
        { title: 'Services', payload: '/services' },
      ],
    };
    setMessages((prevMessages) => [...prevMessages, applicationServicesMessage]);
  };

  // Placeholder for Infrastructure Services
  const handleInfrastructureServices = () => {
    // Implement logic for Infrastructure Services
  };

  // Placeholder for Management Services
  const handleManagementServices = () => {
    // Implement logic for Management Services
  };

  const renderButtons = (buttons) => {
    return (
      <div className="button-container">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(button.payload)}
            className={button.payload.startsWith('/') ? 'dropdown-button' : 'button-link'}
          >
            {button.title}
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    // Scroll to the bottom of the chat messages when buttons are rendered
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="header">
        <h1>Hello .....Happy to Help!</h1>
      </div>

      {/* Chat App Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.user === 'bot' ? 'bot-message' : 'user-message'}
            >
              {msg.user === 'bot' && <img className="avatar" src={botAvatar} alt="Bot Avatar" />}
              <div className="message-content">
                {msg.user === 'bot' ? (
                  <span className="message-sender">{msg.name}</span>
                ) : (
                  <span className="message-sender">{msg.name}: </span>
                )}
                {msg.text}
                {msg.options && renderDropdown(msg.options)}
                {msg.buttons && renderButtons(msg.buttons)}
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
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;

import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chats');
      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !currentChatId) {
        setCurrentChatId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatName.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newChatName }),
      });

      const data = await response.json();
      if (data.success) {
        setChats([{ id: data.chatId, name: data.name }, ...chats]);
        setCurrentChatId(data.chatId);
        setNewChatName('');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      setChats(chats.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(chats[0]?.id || null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !currentChatId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          chatId: currentChatId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prevMessages => [...prevMessages, 
          { id: data.userMessageId, chat_id: currentChatId, content: inputMessage, sender: 'user', timestamp: new Date().toISOString() },
          { id: data.botMessageId, chat_id: currentChatId, content: data.botResponse, sender: 'bot', timestamp: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="sidebar">
          <div className="new-chat">
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="New chat name..."
              onKeyPress={(e) => e.key === 'Enter' && handleCreateChat()}
            />
            <button onClick={handleCreateChat}>Create Chat</button>
          </div>
          <div className="chat-list">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
              >
                <span onClick={() => setCurrentChatId(chat.id)}>{chat.name}</span>
                <button 
                  className="delete-chat"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-main">
          <div className="chat-header">
            <h2>{chats.find(chat => chat.id === currentChatId)?.name || 'Select or create a chat'}</h2>
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading || !currentChatId}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !currentChatId}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_BASE = 'https://www.1secmail.com/api/v1/';

function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let name = '';
  for (let i = 0; i < 10; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return {
    login: name,
    domain: '1secmail.com',
    email: `${name}@1secmail.com`,
  };
}

function LoadingSpinner() {
  return <div className="spinner"></div>;
}

function App() {
  const [emailInfo, setEmailInfo] = useState(generateRandomEmail());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [emailInfo]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        params: {
          action: 'getMessages',
          login: emailInfo.login,
          domain: emailInfo.domain,
        },
      });
      setMessages(res.data);
    } catch (err) {
   
    }
    setLoading(false);
  };

  const fetchEmailBody = async (id) => {
    try {
      const res = await axios.get(API_BASE, {
        params: {
          action: 'readMessage',
          login: emailInfo.login,
          domain: emailInfo.domain,
          id,
        },
      });
      toast.info(
        <div>
          <b>{res.data.subject}</b>
          <p>{res.data.textBody}</p>
        </div>,
        {
          autoClose: 8000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch {
      toast.error('Failed to load email content');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailInfo.email);
    toast.success('Email Copied!');
  };

  const generateNewEmail = () => {
    const newEmail = generateRandomEmail();
    setEmailInfo(newEmail);
    setMessages([]);
    toast.info('New email generated!');
  };

  return (
    <div className="app-container">
     <header>
  <img
    src="https://www.freeiconspng.com/uploads/email-icon-3.jpg"
    alt="Temp Mail"
    className="logo-icon"
  />
  <button
    className="dark-toggle"
    onClick={() => setDarkMode(!darkMode)}
    aria-label="Toggle dark mode"
  >
    {darkMode ? '🌙 Dark' : '☀️ Light'}
  </button>
</header>

      <main>
        <section className="email-section">
          <input
            type="text"
            readOnly
            value={emailInfo.email}
            className="email-input"
          />
          <button onClick={copyToClipboard} className="btn">
            Copy
          </button>
          <button onClick={generateNewEmail} className="btn btn-secondary">
            New Email
          </button>
        </section>

        <section className="inbox-section">
          <h2>Inbox</h2>
          {loading ? (
            <LoadingSpinner />
          ) : messages.length === 0 ? (
            <p className="empty-msg">No messages yet...</p>
          ) : (
            <ul className="message-list">
              {messages.map((msg) => (
                <li key={msg.id} className="message-item">
                  <div>
                    <strong>From:</strong> {msg.from}
                  </div>
                  <div>
                    <strong>Subject:</strong> {msg.subject}
                  </div>
                  <div className="message-actions">
                    <button onClick={() => fetchEmailBody(msg.id)} className="btn btn-read">
                      Read
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <ToastContainer position="top-right" />
    </div>
  );
}

export default App;

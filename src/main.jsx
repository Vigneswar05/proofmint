import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Force HTTPS in production
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

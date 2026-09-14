import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './components/reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
    <Toaster position="bottom-right" />
  </React.StrictMode>,
);
reportWebVitals();
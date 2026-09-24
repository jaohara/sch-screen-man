import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/style.css';
import './styles/variables.css';

import { SettingsProvider } from './context/SettingsContext.jsx';
import { UIStateProvider } from './context/UIContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <UIStateProvider>
        <App />
      </UIStateProvider>
    </SettingsProvider>
  </React.StrictMode>,
);

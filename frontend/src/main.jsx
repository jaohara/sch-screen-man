import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/style.css';
import './styles/variables.css';

import { BrowserRouter } from "react-router";

import { ScreensProvider } from './context/ScreensContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { UIStateProvider } from './context/UIContext.jsx';
import { ContentProvider } from './context/ContentContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <UIStateProvider>
        <ScreensProvider>
          <ContentProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ContentProvider>
        </ScreensProvider>
      </UIStateProvider>
    </SettingsProvider>
  </React.StrictMode>,
);

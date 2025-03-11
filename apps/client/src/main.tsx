import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './game/GameContext';
import { AuthProvider } from './auth/AuthContext';

// Hide the loading screen once the app is ready
const hideLoadingScreen = () => {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.classList.add('fade-out');
    setTimeout(() => {
      loadingElement.remove();
    }, 500);
  }
};

// Initialize the React app
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </AuthProvider>
  </React.StrictMode>
);

// Hide loading screen after the app is mounted
window.addEventListener('load', hideLoadingScreen);
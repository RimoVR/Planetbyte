import * as React from 'react';
import { useGame } from './game/GameContext';
import { useAuth } from './auth/AuthContext';
import './App.css';
import { Faction } from '@planetbyte/common';

function App() {
  const { gameState, initializeGame } = useGame();
  const { authState, login } = useAuth();
  

  // Initialize the game when the component mounts
  useEffect(() => {
    if (!gameState.isInitialized && !gameState.isLoading) {
      initializeGame();
    }
  }, [gameState.isInitialized, gameState.isLoading, initializeGame]);

  
  // Auto-login for development purposes
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.isLoading) {
      login('Player', Faction.RED);
    }
  }, [authState.isAuthenticated, authState.isLoading, login]);

  return (
    <div className="app-container">
      <header>
        <h1>PlanetByte</h1>
        {authState.user && (
          <div className="user-info fade-in">
            <span><strong>Player:</strong> {authState.user.username}</span>
            <span className={`faction-${authState.user.faction}`}>
              <strong>Faction:</strong> {getFactionName(authState.user.faction)}
            </span>
            <span><strong>Level:</strong> {authState.user.level}</span>
            <span><strong>Elo:</strong> {authState.user.eloRating}</span>
          </div>
        )}
      </header>

      <main>
        {gameState.error && (
          <div className="error-message">
            Error initializing game: {gameState.error}
          </div>
        )}

        <div id="game-container" className="game-container">
          {/* Phaser game will be mounted here */}
          {gameState.isLoading && <div className="loading">Loading game...</div>}
          
          {/* Game UI overlay */}
          {gameState.isInitialized && !gameState.isLoading && (
            <div className="game-ui fade-in">
              {/* Mini map */}
              <div className="mini-map"></div>
              
              {/* Health bar */}
              <div className="health-bar">
                <div className="health-bar-fill"></div>
              </div>
              
              {/* Faction status */}
              <div className="faction-status">
                <div className="faction-indicator" style={{ backgroundColor: '#ff5252' }}></div>
                <div className="faction-indicator" style={{ backgroundColor: '#2ecc71' }}></div>
                <div className="faction-indicator" style={{ backgroundColor: '#3498db' }}></div>
              </div>
              
              {/* Ability slots */}
              <div className="ability-slots">
                <div className="ability-slot">M</div>
                <div className="ability-slot">O</div>
                <div className="ability-slot">D</div>
                <div className="ability-slot">S</div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <p>PlanetByte v0.1.0 - A 2D top-down third-person shooter MMO</p>
      </footer>
    </div>
  );
}

// Helper function to get faction name from faction enum
function getFactionName(faction: Faction): string {
  switch (faction) {
    case Faction.RED:
      return 'Red Dominion';
    case Faction.BLUE:
      return 'Blue Alliance';
    case Faction.GREEN:
      return 'Green Collective';
    default:
      return 'Unknown';
  }
}

const { useEffect } = React;

export default App;
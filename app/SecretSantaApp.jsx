'use client';
import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import SetupPage from './setuppage.jsx';
import ReviewParticipants from './ReviewParticipants.jsx';

const COLORS = [
  '#987284', // Mountbatten Pink
  '#75B9BE', // Vergidiris
  '#D0D6B5', // Beige
  '#F9B5AC', // Melon
  '#EE7674', // Light Coral
  '#CEDFD9', // Azure
  '#FEEFDD', // Antique White
  '#32CD32'  // lime green
];

export default function SecretSantaApp() {
  // All state declarations consolidated at the top
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [appData, setAppData] = useState({
    matches: {},
    userDemographics: {},
    users: {}
  });
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [loginError, setLoginError] = useState('');
  const [giftSuggestions, setGiftSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Refs
  const wheelContainerRef = useRef(null);
  const wheelRef = useRef(null);

  const [showReview, setShowReview] = useState(false);
  const [editingParticipantIndex, setEditingParticipantIndex] = useState(null); 

  // Handle setup completion
  const handleSetupComplete = (setupData) => {
    setAppData(setupData);
    setShowReview(true);
  };

  const handleEditParticipant = (index) => {
    setEditingParticipantIndex(index);
    setShowReview(false);
  };
  
  const handleConfirmParticipants = async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          gameData: appData
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setGameCode(data.gameCode);
      setIsSetup(true);
      setShowReview(false);
      setShowGameCode(true);
    } catch (error) {
      alert('Failed to create game: ' + error.message);
    }
  };

  // Handle joining existing game
  const handleJoinGame = async (enteredCode) => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load',
          gameCode: enteredCode
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setGameCode(enteredCode);
      setAppData(data);
      setIsSetup(true);
      setIsJoining(false);
    } catch (error) {
      alert('Failed to join game: ' + error.message);
    }
  };

  const getGiftSuggestions = async (recipientName) => {
    try {
      const prompt = generateGiftPrompt(recipientName);
      
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
  
      const data = await response.json();
      
      // Log the response
      console.log('API Response:', data);
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch gift suggestions');
      }
  
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }
  
      if (data.suggestions.length === 0) {
        throw new Error('No suggestions returned');
      }
  
      return data.suggestions;
    } catch (error) {
      console.error('Error getting gift suggestions:', error);
      setGiftSuggestions(['Failed to get gift suggestions. Please try again.']);
      return null;
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const loadWheel = async () => {
        try {
          const { Wheel } = await import('spin-wheel');
          if (wheelContainerRef.current && !wheelRef.current) {
            const props = {
              items: Object.keys(appData.users).map((name, index) => ({
                label: name,
                weight: 1,
                backgroundColor: COLORS[index % COLORS.length]
              })),
              itemLabelRadiusMax: 0.7,
              itemLabelFontSize: '32px',
              rotationResistance: -50,
              itemLabelAlign: 'center',
              itemLabelColors: ['#000000'],
              radius: 0.85,
            };

            wheelRef.current = new Wheel(wheelContainerRef.current, props);
          }
        } catch (error) {
          console.error('Error loading wheel:', error);
        }
      };

      loadWheel();
    }
  }, [isAuthenticated, appData.users]);


  
  // Modified login handler to use appData.users
  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUser || !birthYear) {
      setLoginError('Please fill in all fields');
      return;
    }

    if (appData.users[selectedUser] === birthYear) {
      setIsAuthenticated(true);
      setCurrentUser(selectedUser);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setSelectedUser('');
    setBirthYear('');
    setShowMatch(false);
    setCurrentMatch('');
    wheelRef.current = null;
  };

  const [showGameCode, setShowGameCode] = useState(true);


  const generateGiftPrompt = (recipientName) => {
    const demographics = appData.userDemographics[recipientName];
    const age = new Date().getFullYear() - demographics.birthYear;
  
    return `You are helping with Secret Santa shopping. Suggest 6 specific gifts under $30 for ${recipientName} (${age} years old).
  
  Their interests: ${demographics.interests.join(', ')}
  
  Use this exact format, one per line:
  - Gift name - Brief reason they'll like it`;
  };

  // Modified spin handler to use appData.matches
  const handleSpin = async (currentUser) => {
    if (!wheelRef.current) return;
    
    const names = Object.keys(appData.users);
    const matchName = appData.matches[currentUser];
    const matchIndex = names.indexOf(matchName);
    
    setShowMatch(false);
    setGiftSuggestions(null);
    wheelRef.current.spinToItem(matchIndex, 3000, true, 2, 1);
    
    setTimeout(async () => {
      setCurrentMatch(matchName);
      setShowMatch(true);
      
      setIsLoadingSuggestions(true);
      const suggestions = await getGiftSuggestions(matchName);
      setGiftSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 3000);
  };

  const handleContinueToLogin = () => {
    setShowGameCode(false);
  };

const renderJoinGame = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    padding: '20px'
  }}>
    <h1>Secret Santa</h1>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginTop: '20px'
    }}>
      <button
        onClick={() => setIsJoining(false)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Create New Game
      </button>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Enter Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={() => handleJoinGame(gameCode)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Join Game
        </button>
      </div>
    </div>
  </div>
);

  // Render logic based on setup and authentication state
  if (showReview) {
    return <ReviewParticipants 
      participants={Object.entries(appData.users).map(([name, birthYear]) => ({
        name,
        birthYear,
        interests: appData.userDemographics[name].interests.join(', ')
      }))}
      onEdit={handleEditParticipant}
      onConfirm={handleConfirmParticipants}
    />;
  }

  if (!isSetup) {
    if (isJoining) {
      return renderJoinGame();
    }
    return (
      <div>
        <button
          onClick={() => setIsJoining(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Join Existing Game
        </button>
        <SetupPage onSetupComplete={handleSetupComplete} />
      </div>
    );
  }

  else if (isSetup && !isAuthenticated && !isJoining && showGameCode) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <h1>Game Created Successfully!</h1>
        <div style={{
          marginTop: '20px',
          padding: '20px',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>Your Game Code:</h2>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: '#4CAF50',
            margin: '10px 0'
          }}>
            {gameCode}
          </p>
          <p>Share this code with other participants so they can join the game.</p>
        </div>
        <button
          onClick={handleContinueToLogin}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continue to Login
        </button>
      </div>
    );
  }

  else if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>Secret Santa Login</h1>
        <form 
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '300px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Select Your Name:
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
            >
              <option value="">Choose your name...</option>
              {Object.keys(appData.users).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Birth Year:
            </label>
            <input
              type="password"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="YYYY"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              required
            />
          </div>

          {loginError && (
            <div style={{ color: 'red', fontSize: '14px' }}>
              {loginError}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  console.log('States:', {
    showReview,
    isSetup,
    isAuthenticated,
    isJoining,
    showGameCode
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <Script 
        src="https://cdn.jsdelivr.net/npm/spin-wheel@4.1.1/dist/spin-wheel-iife.js" 
        strategy="beforeInteractive"
      />
      
      <h1>Secret Santa Wheel</h1>
      <p style={{ 
        fontSize: '32px', 
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Welcome, {currentUser}!
      </p>

      <div style={{ 
        position: 'relative', 
        width: '600px',
        height: '620px'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '24px',
          zIndex: 1
        }}>
          ▼
        </div>
        
        <div 
          ref={wheelContainerRef} 
          style={{ 
            width: '600px',
            height: '600px',
            position: 'absolute',
            top: '20px'
          }}
        />
      </div>
      
      <div style={{ 
        marginTop: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => handleSpin(currentUser)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Spin Wheel
        </button>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {showMatch && (
        <div style={{ textAlign: 'center', marginTop: '20px', maxWidth: '800px' }}>
          <h2>Your Secret Santa match is:</h2>
          <div style={{ fontSize: '24px', color: 'blue', marginBottom: '20px' }}>
            {currentMatch}
          </div>
          
          {isLoadingSuggestions ? (
  <div>Loading gift suggestions...</div>
) : giftSuggestions ? (
  <div style={{ 
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px'
  }}>
    <h3>Gift Suggestions:</h3>
    <ol style={{ 
      paddingLeft: '20px',
      margin: '0'
    }}>
      {giftSuggestions.map((suggestion, index) => (
        <li key={index} style={{ 
          marginBottom: '12px',
          paddingLeft: '10px',
          lineHeight: '1.4'
        }}>
          {suggestion}
        </li>
      ))}
    </ol>
    <button 
      onClick={() => window.open('https://www.amazon.com', '_blank')}
      style={{
        display: 'block',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '12px 24px',
        marginTop: '20px',
        cursor: 'pointer',
        width: '100%',
        fontSize: '16px'
      }}
    >
      Find these gifts on Amazon! 🎁
    </button>
  </div>
) : null}
        </div>
      )}
    </div>
  );
}


'use client';
import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import SetupPage from './setuppage.jsx';

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
  // Add new state for setup
  const [isSetup, setIsSetup] = useState(false);
  const [appData, setAppData] = useState({
    matches: {},
    userDemographics: {},
    users: {}
  });

  // Existing state
  const wheelContainerRef = useRef(null);
  const wheelRef = useRef(null);
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [loginError, setLoginError] = useState('');
  const [giftSuggestions, setGiftSuggestions] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Modified useEffect to use appData.users instead of hardcoded USERS
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
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch gift suggestions');
      }
  
      const data = await response.json();
      console.log('Frontend received:', data); // Debug log
      
      if (!data.suggestions || !Array.isArray(data.suggestions) || data.suggestions.length === 0) {
        throw new Error('Invalid suggestions format received');
      }
  
      return data.suggestions;
    } catch (error) {
      console.error('Error getting gift suggestions:', error);
      return null;
    }
  };

  // Modified generateGiftPrompt to use appData.userDemographics
  const generateGiftPrompt = (recipientName) => {
    const demographics = appData.userDemographics[recipientName];
    const age = new Date().getFullYear() - demographics.birthYear;

    return `You are a helpful gift advisor. I need gift suggestions for ${recipientName}, who is ${age} years old, with a budget under $30.

Their interests include: ${demographics.interests.join(', ')}
They typically enjoy: ${demographics.giftPreferences}

Please provide exactly 10 specific gift ideas that:
1. Cost less than $30
2. Match their interests and preferences
3. Are practical and available from common retailers

For each suggestion, format the response as:
• Gift Name - Brief explanation of why they'd like it based on their interests

Remember to be specific - don't just suggest generic categories. For example, instead of "a book", suggest "The Midnight Library by Matt Haig".`;
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

  // Setup page handler
  const handleSetupComplete = (setupData) => {
    setAppData(setupData);
    setIsSetup(true);
  };

  // Render logic based on setup and authentication state
  if (!isSetup) {
    return <SetupPage onSetupComplete={handleSetupComplete} />;
  }

  if (!isAuthenticated) {
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

  // Rest of the component remains the same...
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
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


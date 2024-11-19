'use client';
import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const USERS = {
  'Rocco': '2004',
  'Victoria': '1990',
  'Hannah': '1995',
  'Bruno': '1985',
  'Marcela': '1988',
  'Miguel': '1992',
  'Steven': '1987'
};

const MATCHES = {
  'Rocco': 'Victoria',
  'Victoria': 'Hannah',
  'Hannah': 'Bruno',
  'Bruno': 'Marcela',
  'Marcela': 'Miguel',
  'Miguel': 'Steven',
  'Steven': 'Rocco'
};

const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#96CEB4', // green
  '#FFEEAD', // yellow
  '#D4A5A5', // pink
  '#9B786F', // brown
  '#A8E6CE'  // mint
];

export default function SecretSantaApp() {
  const wheelContainerRef = useRef(null);
  const wheelRef = useRef(null);
  const [showMatch, setShowMatch] = useState(false);
  const [currentMatch, setCurrentMatch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      const loadWheel = async () => {
        try {
          const { Wheel } = await import('spin-wheel');
          if (wheelContainerRef.current && !wheelRef.current) {
            const props = {
                items: Object.keys(USERS).map((name, index) => ({
                  label: name,
                  weight: 1,
                  backgroundColor: COLORS[index % COLORS.length]
                })),
                itemLabelRadiusMax: 0.7,
                itemLabelFontSize: '16px',
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
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUser || !birthYear) {
      setLoginError('Please fill in all fields');
      return;
    }

    if (USERS[selectedUser] === birthYear) {
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

  const handleSpin = (currentUser) => {
    if (!wheelRef.current) return;
    
    const names = Object.keys(USERS);
    const matchName = MATCHES[currentUser];
    const matchIndex = names.indexOf(matchName);
    
    setShowMatch(false);
    wheelRef.current.spinToItem(matchIndex, 3000, true, 2, 1);
    
    setTimeout(() => {
      setCurrentMatch(matchName);
      setShowMatch(true);
    }, 3000);
  };

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
              {Object.keys(USERS).map(name => (
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
      <p>Welcome, {currentUser}!</p>
      
      <div style={{ 
        position: 'relative', 
        width: '600px',  // Increased from 400px
        height: '620px'  // Increased from 420px
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
            width: '600px',  // Increased from 400px
            height: '600px', // Increased from 400px
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
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h2>Your Secret Santa match is:</h2>
          <div style={{ fontSize: '24px', color: 'blue' }}>{currentMatch}</div>
        </div>
      )}
    </div>
  );
}
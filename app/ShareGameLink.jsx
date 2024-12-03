// ShareGameLink.jsx
import { useState } from 'react';

const ShareGameLink = ({ gameCode, participants }) => {
  const [showCopied, setShowCopied] = useState(false);
  
  const getShareUrl = () => {
    // This will automatically use the correct URL in production
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?code=${gameCode}`;
  };
  
  const getShareMessage = () => {
    const names = Object.keys(participants).join(', ');
    return `Ready to play Secret Santa with ${names}? Log in at ${getShareUrl()} to see your match and get gift ideas! 🎄🎁`;
  };
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareMessage());
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          width: '100%',
          marginBottom: '1rem',
          backgroundColor: '#2196F3',
          color: 'white',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
      >
        Share Game with Participants
      </button>
      
      {showCopied && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '0.875rem'
        }}>
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default ShareGameLink;
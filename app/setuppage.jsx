import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

const SetupPage = ({ onSetupComplete }) => {
  const [participants, setParticipants] = useState([
    { id: 1, name: '', birthYear: '', interests: [], giftPreferences: '' }
  ]);
  const [setupComplete, setSetupComplete] = useState(false);

  const addParticipant = () => {
    if (participants.length >= 8) return; // Limit to 8 participants
    setParticipants([
      ...participants,
      {
        id: participants.length + 1,
        name: '',
        birthYear: '',
        interests: [],
        giftPreferences: ''
      }
    ]);
  };

  const removeParticipant = (id) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id, field, value) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleInterestsChange = (id, value) => {
    // Simple split on commas, trim each value, remove empties
    const interests = value.split(',').map(v => v.trim()).filter(v => v !== '');
    updateParticipant(id, 'interests', interests);
  };
  
  const generateMatches = (participants) => {
    const shuffled = [...participants];
    let matches = {};
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Create matches ensuring no one gets themselves
    for (let i = 0; i < shuffled.length; i++) {
      let nextIndex = (i + 1) % shuffled.length;
      // If last person would get themselves, swap with second-to-last match
      if (i === shuffled.length - 1 && shuffled[nextIndex].name === shuffled[i].name) {
        nextIndex = shuffled.length - 2;
      }
      matches[shuffled[i].name] = shuffled[nextIndex].name;
    }
    
    return matches;
  };

  const handleSetupComplete = () => {
    // Validate all fields are filled
    const isValid = participants.every(p => 
      p.name && p.birthYear && p.interests.length > 0 && p.giftPreferences
    );

    if (!isValid) {
      alert('Please fill in all fields for all participants');
      return;
    }

    const matches = generateMatches(participants);
    
    // Create user demographics object
    const userDemographics = {};
    participants.forEach(p => {
      userDemographics[p.name] = {
        birthYear: parseInt(p.birthYear),
        interests: p.interests,
        giftPreferences: p.giftPreferences
      };
    });

    // Create users object (for login)
    const users = {};
    participants.forEach(p => {
      users[p.name] = p.birthYear;
    });

    onSetupComplete({ matches, userDemographics, users });
    setSetupComplete(true);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>Secret Santa Setup</h1>
      
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #ccc'
      }}>
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            style={{
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#f8f8f8',
              border: '1px solid #e1e1e1'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500' }}>
                Participant {index + 1}
              </h3>
              {participants.length > 1 && (
                <button
                  onClick={() => removeParticipant(participant.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 style={{ width: '20px', height: '20px' }} />
                </button>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Name
              </label>
              <input
                type="text"
                value={participant.name}
                onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                placeholder="First Name"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Birth Year
              </label>
              <input
                type="text"
                value={participant.birthYear}
                onChange={(e) => updateParticipant(participant.id, 'birthYear', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                placeholder="YYYY"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Interests (comma-separated)
              </label>
              <input
              type="text"
              value={participant.interests.join(', ')} // This stays the same
              onChange={(e) => handleInterestsChange(participant.id, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
              placeholder="e.g., reading, cooking, gaming"
            />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Gift Preferences
              </label>
              <input
                type="text"
                value={participant.giftPreferences}
                onChange={(e) => updateParticipant(participant.id, 'giftPreferences', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                placeholder="e.g., books and kitchen gadgets"
              />
            </div>
          </div>
        ))}

        {participants.length < 8 && (
          <button
            onClick={addParticipant}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              padding: '8px 0',
              marginBottom: '20px'
            }}
          >
            <Plus style={{ width: '20px', height: '20px' }} />
            Add Participant
          </button>
        )}

        <button
          onClick={handleSetupComplete}
          disabled={setupComplete}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: setupComplete ? '#6c757d' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: setupComplete ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Save style={{ width: '20px', height: '20px' }} />
          {setupComplete ? 'Setup Complete!' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
};

export default SetupPage;
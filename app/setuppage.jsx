import React, { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react';

const SetupPage = ({ onSetupComplete }) => {
  const [participants, setParticipants] = useState([
    { id: 1, name: '', birthYear: '', interests: '' } 
  ]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [expandedCards, setExpandedCards] = useState([1]); 

  const toggleCard = (id) => {
    setExpandedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };

  const addParticipant = () => {
    if (participants.length >= 8) return;
    const newId = participants.length + 1;
    setParticipants([
      ...participants,
      {
        id: newId,
        name: '',
        birthYear: '', 
        interests: '', 
      }
    ]);
    setExpandedCards(prev => [...prev, newId]);
  };

  const removeParticipant = (id) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter(p => p.id !== id));
    setExpandedCards(prev => prev.filter(cardId => cardId !== id));
  };

  const updateParticipant = (id, field, value) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const generateMatches = (participants) => {
    const shuffled = [...participants];
    let matches = {};
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    for (let i = 0; i < shuffled.length; i++) {
      let nextIndex = (i + 1) % shuffled.length;
      if (i === shuffled.length - 1 && shuffled[nextIndex].name === shuffled[i].name) {
        nextIndex = shuffled.length - 2;
      }
      matches[shuffled[i].name] = shuffled[nextIndex].name;
    }
    
    return matches;
  };

  const handleSetupComplete = () => {
    const isValid = participants.every(p => 
      p.name && p.birthYear && p.interests 
    );
  
    if (!isValid) {
      alert('Please fill in all fields for all participants');
      return;
    }
  
    const matches = generateMatches(participants);
    const userDemographics = {};
    participants.forEach(p => {
      userDemographics[p.name] = {
        birthYear: parseInt(p.birthYear),
        interests: p.interests.split(',').map(i => i.trim()).filter(Boolean)
      };
    });

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
      padding: '40px 20px' 
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        marginBottom: '40px'
      }}>
        Setup Your Secret Santa In 5 Minutes
      </h1>
        
      <div style={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #ccc'
      }}>
        <p style={{
          color: '#666',
          fontSize: '18px',
          lineHeight: '1.5',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Add your participants below with their birth year (which they'll use for login) and interests. 
          Once complete, each person will get a unique login to discover their match and get some gift suggestions!
        </p>
  
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            style={{
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: '#f8f8f8',
              border: '1px solid #e1e1e1'
            }}
          >
            <div 
              onClick={() => toggleCard(participant.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {expandedCards.includes(participant.id) 
                  ? <ChevronDown style={{ width: '20px', height: '20px' }} />
                  : <ChevronRight style={{ width: '20px', height: '20px' }} />
                }
                <h3 style={{ fontSize: '18px', fontWeight: '500' }}>
                  {participant.name || `Participant ${index + 1}`}
                </h3>
              </div>
              
              {participants.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeParticipant(participant.id);
                  }}
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
  
            {expandedCards.includes(participant.id) && (
              <div style={{ padding: '0 20px 20px 20px' }}>
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
                    value={participant.interests}
                    onChange={(e) => updateParticipant(participant.id, 'interests', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    placeholder="e.g., reading, cooking, gaming"
                  />
                </div>
              </div>
            )}
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
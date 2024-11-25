// ReviewParticipants.jsx
const ReviewParticipants = ({ participants, onEdit, onConfirm }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Review Participants</h1>
      
      <div style={{ width: '100%', marginTop: '20px' }}>
        {participants.map((participant, index) => (
          <div 
            key={index}
            style={{
              padding: '15px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f8f8f8'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: '0' }}>{participant.name}</h3>
              <button
                onClick={() => onEdit(index)}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>
            <div style={{ marginTop: '10px' }}>
              <p><strong>Birth Year:</strong> {participant.birthYear}</p>
              <p><strong>Interests:</strong> {participant.interests}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={onConfirm}
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
        Confirm & Generate Game Code
      </button>
    </div>
  );
};

export default ReviewParticipants;
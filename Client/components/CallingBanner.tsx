interface CallBannerProps {
    callerId: string;
    callerName: string;
    callerImage: string;
    onAccept: () => void;
    onReject: () => void;
  }
  
  const CallBanner: React.FC<CallBannerProps> = ({
    callerId,
    callerName,
    callerImage,
    onAccept,
    onReject,
  }) => {
    return (
      <div style={styles.banner}>
        <div style={styles.left}>
          <img src={callerImage} alt="Caller" style={styles.avatar} />
          <div>
            <p style={styles.name}>{callerName}</p>
            <p style={styles.id}>ID: {callerId}</p>
          </div>
        </div>
        <div style={styles.buttons}>
          <button onClick={onAccept} style={styles.accept}>Accept</button>
          <button onClick={onReject} style={styles.reject}>Reject</button>
        </div>
      </div>
    );
  };
  
  const styles = {
    banner: {
      position: 'fixed' as 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#2d2d2d',
      color: 'white',
      padding: '12px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      objectFit: 'cover' as const,
    },
    name: {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      margin: 0,
    },
    id: {
      fontSize: '12px',
      color: '#aaa',
      margin: 0,
    },
    buttons: {
      display: 'flex',
      gap: '10px',
    },
    accept: {
      backgroundColor: 'green',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    reject: {
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
  };
  
  export default CallBanner;
  
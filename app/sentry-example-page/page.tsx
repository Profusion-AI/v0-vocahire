"use client";

export default function SentryExamplePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '20px'
    }}>
      <h1>Sentry Error Testing Page</h1>
      <p>Click the button below to trigger a test error and verify Sentry integration.</p>
      
      <button
        type="button"
        onClick={() => {
          throw new Error("Sentry Example Frontend Error - This is a test!");
        }}
        style={{
          background: '#f56565',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Trigger Frontend Error
      </button>

      <button
        type="button"
        onClick={async () => {
          // Trigger an API error
          try {
            await fetch('/api/sentry-example-api');
          } catch (error) {
            console.error('API call failed:', error);
          }
        }}
        style={{
          background: '#4299e1',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Trigger API Error
      </button>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        <p>After clicking a button, check your Sentry dashboard to see if the error was captured.</p>
        <p>Organization: <strong>profusion-ai-ny</strong></p>
        <p>Project: <strong>sentry-indigo-zebra</strong></p>
      </div>
    </div>
  );
}
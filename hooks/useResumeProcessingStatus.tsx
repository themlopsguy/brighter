import { useState, useEffect } from 'react';

interface ProcessingStatus {
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
}

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'
  : 'https://your-production-api-url.com';

export function useResumeProcessingStatus(userId: string, shouldCheck: boolean = false) {
  const [status, setStatus] = useState<ProcessingStatus>({
    isLoading: true,
    isComplete: false,
    error: null
  });

  useEffect(() => {
    if (!shouldCheck || !userId) return;

    // Fix: Use number type for React Native
    let intervalId: number;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/resume/status/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'completed') {
          setStatus({
            isLoading: false,
            isComplete: true,
            error: null
          });
          
          // Stop polling once complete
          if (intervalId) {
            clearInterval(intervalId);
          }
        } else {
          setStatus({
            isLoading: true,
            isComplete: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error checking resume processing status:', error);
        setStatus({
          isLoading: false,
          isComplete: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    // Check immediately
    checkStatus();
    
    // Then poll every 3 seconds until complete
    intervalId = setInterval(checkStatus, 3000) as unknown as number;
    
    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId, shouldCheck]);

  return status;
}
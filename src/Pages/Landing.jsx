import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videoSource from '../Assets/1022.mp4'; // Import the video directly

const LandingPage = () => {
  const [greetingIndex, setGreetingIndex] = useState(0); // Track the current greeting index
  const [showGreetings, setShowGreetings] = useState(false); // Show greetings after video ends
  const greetings = useMemo(() => ['Hey!', 'Do you know what true love feels like.', 'Hmm... Are you sure??', 'Come, let me show you.'], []);
  const videoRef = useRef(null); // Reference to the video element

  const navigate = useNavigate();

  const navigateToHome = useCallback(() => {
    navigate('/home'); // Use navigate function from react-router-dom
  }, [navigate]);

  useEffect(() => {
    // Update greeting every 2 seconds once video ends
    let interval;
    if (showGreetings) {
      interval = setInterval(() => {
        setGreetingIndex((prevIndex) => {
          if (prevIndex < greetings.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(interval); // Stop cycling through greetings
            navigateToHome(); // Navigate to home after the last greeting
            return prevIndex; // Keep the last greeting
          }
        });
      }, 2000);
    }

    return () => clearInterval(interval); // Clean up on unmount
  }, [greetings, showGreetings, navigateToHome]);

  const handleVideoEnd = () => {
    setShowGreetings(true); // Show greetings after the video ends
  };

  return (
    <div className="h-screen bg-white flex justify-center items-center relative">
      {/* Video Element */}
      {!showGreetings && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline // Ensure autoplay works on mobile browsers
          className="absolute top-0 left-0 w-full h-full object-cover"
          onEnded={handleVideoEnd} // Trigger when video ends to start greetings
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Greeting Text */}
      {showGreetings && (
        <p className="text-lg font-bold text-rose-gold animate-pulse">
          {greetings[greetingIndex]}
        </p>
      )}
    </div>
  );
};

export default LandingPage;

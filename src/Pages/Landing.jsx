import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import videoSource from '../Assets/1022.mp4'; // Import the video directly

const LandingPage = () => {
  const [greetingIndex, setGreetingIndex] = useState(0); // Track the current greeting index
  const [showVideo, setShowVideo] = useState(false); // Track video visibility
  const greetings = useMemo(() => ['Hey!', 'Do you know what true love feels like.', 'Hmm... Are you sure??', 'Come, let me show you.'], []);
  const videoRef = useRef(null); // Reference to the video element
  const [videoLoaded, setVideoLoaded] = useState(false); // Track if the video is loaded

  const navigate = useNavigate();

  const navigateToHome = useCallback(() => {
    navigate('/home'); // Use navigate function from react-router-dom
  }, [navigate]);

  useEffect(() => {
    // Update greeting every 2 seconds
    const interval = setInterval(() => {
      setGreetingIndex((prevIndex) => {
        if (prevIndex < greetings.length - 1) {
          return prevIndex + 1;
        } else {
          clearInterval(interval); // Stop cycling through greetings
          setShowVideo(true); // Show video after greetings are done
          return prevIndex; // Keep the last greeting
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [greetings]);

  useEffect(() => {
    // Play the video only after it's fully loaded and visible
    if (showVideo && videoLoaded) {
      videoRef.current.play(); // Start the video playback
      const videoDuration = 15000; // Set a default video duration of 15 seconds

      const timeout = setTimeout(() => {
        navigateToHome(); // Navigate to home after the video finishes
      }, videoDuration);

      return () => clearTimeout(timeout);
    }
  }, [showVideo, videoLoaded, navigateToHome]);

  const handleVideoCanPlay = () => {
    setVideoLoaded(true); // Ensure the video is ready to play
  };

  return (
    <div className="h-screen bg-white flex justify-center items-center relative">
      {/* Video Element */}
      {!showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline // Ensure autoplay works on mobile browsers
          onCanPlay={handleVideoCanPlay} // Trigger when video is ready to play
          className="absolute top-0 left-0 w-full h-full object-cover"
          onEnded={navigateToHome} // Navigate to home when video ends
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Greeting Text */}
      {showVideo && (
        <p className="text-lg font-bold text-rose-gold animate-pulse">
          {greetings[greetingIndex]}
        </p>
      )}
    </div>
  );
};

export default LandingPage;

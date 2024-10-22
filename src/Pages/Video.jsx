import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import videoSource from '../Assets/1024.mp4'; // Video source

const VideoPage = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Navigate to the landing page when the video ends
  const handleVideoEnd = () => {
    navigate('/landing'); // Navigate to the landing page after video ends
  };

  useEffect(() => {
    // Play the video once the component is mounted
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="h-screen bg-black flex justify-center items-center relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
        onEnded={handleVideoEnd}
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPage;

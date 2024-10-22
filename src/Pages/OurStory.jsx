import React, { useState } from 'react';
import { motion } from 'framer-motion'; // For the animation
import throwback1 from '../Assets/IMG_4468.PNG'; // Replace with your throwback image paths
import throwback2 from '../Assets/IMG_4467.PNG';
import throwback3 from '../Assets/IMG_4469.PNG';

const OurLoveStory = () => {
  const [selectedStory, setSelectedStory] = useState('');
  const [showThrowback, setShowThrowback] = useState(false); // For showing throwback images

  const wifeStory = [
    `When stars align, gazes meet, and when you feel a flicker down your spine like you’ve just been shot in the heart by cupids bow and you are conflicted on if you should smile or cry from the sharp pain you feel in your heart or the tiny knot of butterflies you feel in your belly, you know right there and then that that specific moment in time was just meant to be.
We met in bowen university, September 2015 during our orientation and I guess I saw him first when he walked in with this hideous glasses 😂, he looked really fine and dark and
 I noticed how tall he was and I just took my mind off anything. However, he claimed to have seen me first talking with my friends and wanted to say hi to me after the orientation which he did outside of NLS in bowen and surprisingly we had a mutual friend. He would talk to me through this mutual friend and ask her to send his regards before he eventually asked for my number. We remained friends, even close friends if I may say because he tells me almost everything including how he’s going to get married to me eventually when I was ready, which he never stopped talking about until 2019 when we eventually decided to meet and I told him how I’ve always felt about him.`,
  ];
  const husbandStory = [
    `It was as if the stars had aligned and fate had written our story long before we even met. Every twist and turn in our lives led us to the moment where our paths crossed. From the very beginning, it felt like destiny had a hand in bringing us together, creating a love that was meant to be.
Bowen University brought us together. I first saw her at the NLS hall with her friends during our orientation days in 100level. She looked so pretty and short and I wanted to say hi to her which I did after the orientation. I kept asking our mutual friend to send my regards to her and when I saw that she had really noticed me, I asked for her number. 😁
We became friends and I always tell her that I’ll be the one to marry her and I’m so happy I’m about to.
Dec 2019, she told me how she has always felt about me and we started dating. June 2024, I asked her to marry me and she said YES.`,
  ];

  const handleSelect = (side) => {
    setSelectedStory(side);
    setShowThrowback(false); // Reset throwback images visibility
  };

  const handleShowThrowback = () => {
    setShowThrowback(true); // Show throwback images when button is clicked
  };

  return (
    <div className="w-full mx-auto p-5 text-rose-dark-tint">
      {/* Header */}
      <h1 className="text-center font-cardo text-xl lg:text-xl font-bold m-2">
       OUR STORY
      </h1>

      {/* Image Container - One Image, Divided Interaction */}
      <motion.div
        className="relative bg-cover h-72 rounded-xl bg-top-5 w-full lg:w-3/4 mx-auto shadow-sub lg:h-svh"
        style={{ backgroundImage: `url(${require('../Assets/IFX_3681.jpg')})`, borderRadius: '.75em' }}
        
      >
        {/* Dividing the Image into Left and Right Sections */}
        <div className="w-full h-full flex">
          {/* Left side (Wife's POV) */}
          <div
            className="w-1/2 h-full cursor-pointer rounded-l-xl flex justify-center items-center bg-black bg-opacity-20  relative"
            onClick={() => handleSelect('wife')}
          >
            {/* Bubble Text on Hover */}
            <div className="absolute bottom-32 left-4 lg:bottom-56 lg:left-20 transform -translate-y-10 opacity-100 transition-opacity duration-300 w-48 lg:w-60 p-2 bg-white text-black rounded-lg shadow-lg text-xs lg:text-base text-center">
              I know you want the gist, be demure and gently tap me and I'll give you sweet gist.
              <div className="absolute right-14 bottom-[-4px] w-2 h-2 bg-white rotate-45 transform -translate-x-1/2"></div>
            </div>
          </div>

          {/* Right side (Husband's POV) */}
          <div
            className="w-1/2 h-full cursor-pointer rounded-r-xl flex justify-center items-center bg-black bg-opacity-20 "
            onClick={() => handleSelect('husband')}
          >
            <div className="absolute top-80 -right-4 lg:top-3/4 lg:-right-20 transform -translate-y-10 opacity-100 transition-opacity duration-300 w-56 lg:w-60 p-2 bg-white text-black rounded-lg shadow-lg text-xs lg:text-base text-center">
              You can read mine after reading MY Wife's version.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Display Story */}
      <div className="mt-10">
        {selectedStory === 'wife' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-left lg:w-3/4 mx-auto p-5 bg-rose-light rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Fiponmile's POV</h2>
            <p>{wifeStory}</p>
            <button
              className="mt-4 bg-rose-gold text-white py-2 px-4 rounded-lg "
              onClick={() => handleSelect('husband')}
            >
              My Husband's Version
            </button>
          </motion.div>
        )}

        {selectedStory === 'husband' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-left lg:w-3/4 mx-auto p-5 bg-rose-light rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Dayo's POV</h2>
            <p>{husbandStory}</p>
            <button
              className="mt-4 bg-rose-gold text-white py-2 px-4 rounded-lg "
              onClick={handleShowThrowback}
            >
              See Our Throwback
            </button>

            {/* Display Throwback Images */}
            {showThrowback && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <img
                  src={throwback1}
                  alt="Throwback 1"
                  className="w-full h-auto rounded-lg"
                />
                <img
                  src={throwback2}
                  alt="Throwback 2"
                  className="w-full h-auto rounded-lg"
                />
                <img
                  src={throwback3}
                  alt="Throwback 3"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OurLoveStory;

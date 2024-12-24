import React from 'react';
import '../styles/BackgroundMotion.css'; // Updated path to reference the CSS file in 'src/styles'

const BackgroundMotion = () => {
  return (
    <div className="background-container">
      {/* Shapes that will move with animation */}
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      <div className="shape shape-4"></div>

      {/* Tape-like boxes that will move with animation */}
      <div className="shape-tape shape-tape-1"></div>
      <div className="shape-tape shape-tape-2"></div>
      <div className="shape-tape shape-tape-3"></div>
      <div className="shape-tape shape-tape-4"></div>
    </div>
  );
};

export default BackgroundMotion;

import React, { useEffect, useState, useRef } from 'react';
import './PaymentSuccess.css';

const PaymentSuccess = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create and preload audio element
    const audio = new Audio('/sounds/success.mp3');
    audioRef.current = audio;

    // Preload the audio file
    audio.load();

    // Start confetti animation immediately
    setShowConfetti(true);

    // Start animation and play sound when audio is ready
    const startAnimation = async () => {
      try {
        // Wait for audio to be loaded
        await new Promise((resolve) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
        });

        // Play sound when animation starts
        await audio.play();
        
        // Wait for animation to complete
        setTimeout(() => {
          setIsAnimating(false);
          // Add small delay after animation before closing
          setTimeout(onComplete, 500);
        }, 2200);
      } catch (err) {
        console.error('Error playing success sound:', err);
        // Continue with animation even if sound fails
        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(onComplete, 500);
        }, 2200);
      }
    };

    startAnimation();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [onComplete]);

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 1.5,
    left: Math.random() * 100,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#4CAF50'][Math.floor(Math.random() * 7)]
  }));

  return (
    <div className="success-popup-overlay">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiParticles.map((particle) => (
            <div
              key={particle.id}
              className="confetti-particle"
              style={{
                left: `${particle.left}%`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`success-popup ${isAnimating ? 'animating' : ''}`}>
        {/* Floating background elements */}
        <div className="floating-bg">
          <div className="float-circle float-1"></div>
          <div className="float-circle float-2"></div>
          <div className="float-circle float-3"></div>
        </div>

        {/* Success badge */}
        <div className="success-badge">✓ Completed</div>

        <div className="success-checkmark">
          <div className="check-icon">
            <span className="icon-line line-tip"></span>
            <span className="icon-line line-long"></span>
            <div className="icon-circle"></div>
            <div className="icon-fix"></div>
          </div>
        </div>
        
        <h3>Payment Successful!</h3>
        <p className="success-subtitle">Your transaction has been completed successfully.</p>
        
      </div>
    </div>
  );
};

export default PaymentSuccess;
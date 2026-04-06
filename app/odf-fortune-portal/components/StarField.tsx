'use client';

import React, { useEffect, useState } from 'react';

const StarField: React.FC = () => {
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: string }[]>([]);

  useEffect(() => {
    const starCount = 100;
    const initialStars = Array.from({ length: starCount }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(initialStars);
  }, []);

  return (
    <div className="star-container">
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            opacity: 0.8,
            animation: `twinkle 3s infinite ease-in-out ${star.delay}`,
            boxShadow: '0 0 10px white',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default StarField;

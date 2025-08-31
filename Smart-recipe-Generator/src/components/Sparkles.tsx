'use client';

import { useState, useEffect } from 'react';

export default function Sparkles() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
          style={{
            left: `${(i * 5.5) % 100}%`,
            top: `${(i * 7.3) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${2 + (i * 0.2) % 2}s`
          }}
        ></div>
      ))}
    </>
  );
} 
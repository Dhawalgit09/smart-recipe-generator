'use client';

import { useState, useEffect } from 'react';

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, speed: number}>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: (i * 20) % (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: (i * 15) % (typeof window !== 'undefined' ? window.innerHeight : 800),
      size: (i % 4) + 1,
      speed: (i % 2) + 0.5
    }));
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.y < 0 ? 0 : 1
          }}
        />
      ))}
    </>
  );
} 
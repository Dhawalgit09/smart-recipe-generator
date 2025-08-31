'use client';

import { useState, useEffect } from 'react';

interface MagicWandCursorProps {
  mousePosition: { x: number; y: number };
}

export default function MagicWandCursor({ mousePosition }: MagicWandCursorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="fixed w-6 h-6 pointer-events-none z-50 transition-transform duration-100 ease-out"
      style={{
        left: mousePosition.x - 12,
        top: mousePosition.y - 12,
        transform: 'rotate(45deg)'
      }}
    >
      <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60 blur-sm"></div>
    </div>
  );
} 
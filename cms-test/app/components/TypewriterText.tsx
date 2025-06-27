"use client";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypewriterText = ({ text, speed = 40, className = "" }: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return;
    
    let currentIndex = 0;
    setDisplayed("");
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayed(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayed}</span>;
};

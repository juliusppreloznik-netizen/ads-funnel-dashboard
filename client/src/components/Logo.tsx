import { useState, useRef } from "react";
import { useLocation } from "wouter";

export default function Logo() {
  const [, setLocation] = useLocation();
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset click count after 1 second
    timeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1000);

    // Check if triple-clicked
    if (clickCount + 1 === 3) {
      setClickCount(0);
      setLocation("/admin");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer select-none"
      style={{ userSelect: "none" }}
    >
      <h1 className="text-2xl font-bold text-primary">Catalyst</h1>
    </div>
  );
}

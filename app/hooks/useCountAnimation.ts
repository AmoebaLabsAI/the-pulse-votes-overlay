import { useState, useEffect } from "react";

export const useCountAnimation = (
  targetValue: number | null,
  duration: number = 1000,
  steps: number = 30
) => {
  const [currentValue, setCurrentValue] = useState(targetValue);

  useEffect(() => {
    if (targetValue === null || targetValue === currentValue) return;

    const startValue = currentValue || 0;
    const difference = targetValue - startValue;
    const increment = difference / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep === steps) {
        setCurrentValue(targetValue);
        clearInterval(timer);
      } else {
        setCurrentValue(Math.round(startValue + increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue, duration, steps, currentValue]);

  return currentValue;
};

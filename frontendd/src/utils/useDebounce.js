import { useState, useEffect } from "react";

/**
 * Custom React hook that debounces a value by a specified delay.
 *
 * @param {*} value - the value to debounce
 * @param {number} delay - milliseconds to wait before updating debounced value
 * @returns {*} debounced value
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup if value or delay changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

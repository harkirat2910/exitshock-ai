import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Animates a number from 0 to `target` when the element scrolls into view.
 * Returns { ref, displayValue } — attach ref to the container element.
 */
export function useAnimatedCounter(target, {
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatFn = null,
} = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const numTarget = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.-]/g, ''));
    if (isNaN(numTarget) || numTarget === 0) {
      setValue(numTarget || 0);
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(numTarget * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setValue(numTarget);
      }
    }

    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  let displayValue;
  if (formatFn) {
    displayValue = formatFn(value);
  } else {
    displayValue = `${prefix}${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${suffix}`;
  }

  return { ref, displayValue, isInView };
}

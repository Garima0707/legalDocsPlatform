import { useEffect, useState, useRef } from 'react';

const useIntersection = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const currentRef = ref.current; // Store the current ref in a variable

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup on unmount or when options change
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef); // Use the stored variable here
      }
      observer.disconnect();
    };
  }, [options]); // `ref` doesn't need to be in dependencies

  return [ref, isIntersecting];
};

export default useIntersection;

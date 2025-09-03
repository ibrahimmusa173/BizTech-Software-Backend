
import { useState, useEffect, useCallback } from 'react';

export default function ImageSlider() {
  // Array of image paths
  const images = [
    'images/Slider/banner_1.png',
    'images/Slider/banner_2.png',
    'images/Slider/banner_3.png'
  ];

  // State to track current image index
  const [count, setCount] = useState(0);

  // Use useCallback to memoize the next function
  const next = useCallback(() => {
    setCount(prevCount => 
      prevCount === images.length - 1 ? 0 : prevCount + 1
    );
  }, [images.length]);

  // Set up interval for automatic sliding
  useEffect(() => {
    const intervalId = setInterval(next, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [next]); // Add next to the dependency array

  return (
    <div className="flex items-center justify-center  ">
    <div className="slider-container border-4  w-[85%]  rounded-xl animate-color-animate" >
      <img 
        
        id="slider" 
        src={images[count]} 
        alt={`Slide ${count + 1}`} 
        className="w-full h-auto duration-300 rounded-xl"
      />
    </div></div>
  );
}
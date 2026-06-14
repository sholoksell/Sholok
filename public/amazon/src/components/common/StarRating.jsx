import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, size = 'sm', showNumber = false }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return 'full';
    if (rating >= i + 0.5) return 'half';
    return 'empty';
  });

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size] || 'text-sm';

  return (
    <span className={`flex items-center gap-0.5 ${sizeClass}`}>
      {stars.map((type, i) =>
        type === 'full' ? (
          <FaStar key={i} className="text-[#FF9900]" />
        ) : type === 'half' ? (
          <FaStarHalfAlt key={i} className="text-[#FF9900]" />
        ) : (
          <FaRegStar key={i} className="text-[#FF9900]" />
        )
      )}
      {showNumber && (
        <span className="ml-1 text-amazon-blue hover:underline cursor-pointer text-xs">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
};

export default StarRating;

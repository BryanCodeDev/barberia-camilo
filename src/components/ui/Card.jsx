import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div
      className={[
        'bg-white rounded-sm border border-[#E4DCC9] p-6',
        'shadow-[0_2px_10px_rgba(112,66,20,0.06)] hover:shadow-[0_10px_28px_-8px_rgba(112,66,20,0.18)]',
        'transition-shadow duration-300',
        className || '',
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;
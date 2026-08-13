import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div
      className={[
        'bg-white border border-[#E4DCC9] rounded-sm shadow-sm',
        className || '',
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;

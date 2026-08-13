import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div
      className={[
        'bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300 border border-[#E4DCC9]',
        className || '',
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;

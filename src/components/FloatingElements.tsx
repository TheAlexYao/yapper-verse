import React from 'react';

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
    </div>
  );
};

export default FloatingElements;
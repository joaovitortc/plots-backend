import React from 'react';

export default function Dropdown({ onSignIn, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
      <button
        onClick={onSignIn}
        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Sign In
      </button>
      <button
        onClick={onClose}
        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Disconnect
      </button>
    </div>
  );
}
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearMessage } from '../slice/formSlice';

const Message = () => {
  const dispatch = useDispatch();
  const message = useSelector(state => state.form.message);

  useEffect(() => {
    if (message.visible) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000); // Hide message after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message.visible, dispatch]);

  if (!message.visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`px-6 py-3 rounded-lg shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        } transition-all duration-300 ease-in-out transform`}
      >
        <p className="text-sm font-medium">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;

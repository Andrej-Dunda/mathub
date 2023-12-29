import './SnackBar.scss';
import React, { Dispatch, useEffect } from 'react';

interface SnackbarProps {
  message: string;
  duration?: number;
  onClose: () => void;
  showSnackbar: boolean;
  setShowSnackbar: Dispatch<React.SetStateAction<boolean>>;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, duration = 3000, onClose, showSnackbar, setShowSnackbar }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
      setShowSnackbar(false)
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, setShowSnackbar]);

  return (
    // <>
    //   {showSnackbar &&
        <div className={`snackbar ${showSnackbar ? 'show' : ''}`}>
          {message}
        </div>
    //   }
    // </>
  );
};

export default Snackbar;

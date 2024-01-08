import './CopyToClipboard.scss'
import React from 'react';
import { useSnackbar } from '../../contexts/SnackbarProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface iCopyToClipboard {
  textToCopy: string;
  label?: string;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}

const CopyToClipboard: React.FC<iCopyToClipboard> = ({ textToCopy, label, className, iconClassName, labelClassName }) => {
  const { openSnackbar } = useSnackbar();
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      openSnackbar('Zkopírováno do schránky!');
    } catch (err) {
      openSnackbar('Chyba při kopírování!');
    }
  };

  return (
    <div className={`copy-to-clipboard ${className && className}`} onClick={handleCopy}>
      <span className={`copy-label ${labelClassName && labelClassName}`}>{label}</span>
      <FontAwesomeIcon
        icon={faCopy}
        color={grayscale900}
        className={`copy-icon ${iconClassName && iconClassName}`}
      />
    </div>
  );
};

export default CopyToClipboard;

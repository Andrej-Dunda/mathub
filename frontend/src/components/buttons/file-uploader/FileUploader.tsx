import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FileUploader.scss';
import React, { useEffect, useRef, useState } from 'react';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface iFileUploader {
  label?: string;
  labelClassName?: string;
  acceptAttributeValue?: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  boxShadow?: boolean;
}

const FileUploader = ({ label, labelClassName, acceptAttributeValue, file, setFile, boxShadow }: iFileUploader) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  useEffect(() => {
    console.log(file?.name)
  }, [file])

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    hiddenFileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFile(files[0]);
      event.target.value = '';
    }
  };

  return (
    <div
      className={`file-uploader drop-file-upload${boxShadow ? ' box-shadow' : ''}`}
      onClick={triggerFileInput}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <FontAwesomeIcon
        icon={faUpload}
        className='file-upload-icon'
        color={grayscale900}
      />
      <span className={`file-upload-label ${labelClassName}`}>
        {file ? `Nahraný soubor: ${file.name}` : label}
      </span>
      <input
        type="file"
        id='hiddenFileInput'
        onChange={onFileChange}
        style={{ display: 'none' }}
        ref={hiddenFileInputRef}
        {...(acceptAttributeValue ? { accept: acceptAttributeValue } : {})}
      />
    </div>
  );
};

export default FileUploader;

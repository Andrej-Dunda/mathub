import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './FileUploader.scss';
import React, { useRef } from 'react';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface iFileUploader {
  label?: string;
  labelClassName?: string;
  acceptAttributeValue?: string;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setFileName?: React.Dispatch<React.SetStateAction<string>>;
}

const FileUploader = ({label, labelClassName, acceptAttributeValue, setFile, setFileName}: iFileUploader) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
      setFileName && setFileName(files[0].name)
    }
  };

  const triggerFileInput = () => {
    // Programmatically click the hidden file input
    hiddenFileInputRef.current?.click();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFile(files[0]);
      setFileName && setFileName(files[0].name)
    }
  };

  return (
    <div className='file-uploader'>
      <label className={`file-upload-label ${labelClassName}`} htmlFor='hiddenFileInput'>{label}</label>
      <div
        className="drop-file-upload"
        onClick={triggerFileInput}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <FontAwesomeIcon
          icon={faUpload}
          className='file-upload-icon'
          color='black'
        />
        {/* <span className='drop-file-upload-label'>Přetáhněte soubor sem</span> */}
      </div>
      <input
        type="file" 
        id='hiddenFileInput' 
        onChange={onFileChange} 
        style={{display: 'none'}} 
        ref={hiddenFileInputRef}
        {...(acceptAttributeValue ? { accept: acceptAttributeValue } : {})}
      />
    </div>
  );
};

export default FileUploader;

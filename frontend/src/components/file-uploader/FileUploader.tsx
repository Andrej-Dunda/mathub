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
  width100?: boolean;
  boxShadow?: boolean;
}

const FileUploader = ({label, labelClassName, acceptAttributeValue, file, setFile, width100, boxShadow}: iFileUploader) => {
  const hiddenFileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  useEffect(() => {
    setFileName(file ? file.name : '')
  }, [file])

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      setFile(files[0]);
      setFileName && setFileName(files[0].name)
    }
  };

  const triggerFileInput = () => {
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
        className={`drop-file-upload${width100 ? ' width-100' : ''}${boxShadow ? ' box-shadow' : ''}`}
        onClick={triggerFileInput}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <FontAwesomeIcon
          icon={faUpload}
          className='file-upload-icon'
          color={grayscale900}
        />
      </div>
      <input
        type="file" 
        id='hiddenFileInput' 
        onChange={onFileChange} 
        style={{display: 'none'}} 
        ref={hiddenFileInputRef}
        {...(acceptAttributeValue ? { accept: acceptAttributeValue } : {})}
      />
      {fileName && <span>{`Nahraný soubor: ${fileName}`}</span>}
    </div>
  );
};

export default FileUploader;

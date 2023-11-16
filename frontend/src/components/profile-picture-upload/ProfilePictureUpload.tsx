import React, { useState, ChangeEvent, FormEvent } from "react";
import './ProfilePictureUpload.scss'
import axios from 'axios';

const ProfilePictureUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      await axios.post('/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const filename = file.name;
      setUploadedFileUrl(`/uploads/${filename}`);
      alert('File uploaded successfully');
    } catch (error) {
      alert('Error uploading file');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {uploadedFileUrl && (
        <img src={uploadedFileUrl} alt="Uploaded Profile" />
      )}
    </div>
  );
}
export default ProfilePictureUpload;

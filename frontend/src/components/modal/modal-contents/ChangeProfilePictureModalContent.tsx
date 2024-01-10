import './ChangeProfilePictureModalContent.scss';
import { useEffect, useState } from 'react'
import axios from 'axios';
import ErrorMessage from '../../../components/error-message/ErrorMessage';
import FileUploader from '../../../components/buttons/file-uploader/FileUploader';
import { useUserData } from '../../../contexts/UserDataProvider';
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useModal } from '../../../contexts/ModalProvider';
import ModalFooter from '../../../components/modal/modal-footer/ModalFooter';

const ChangeProfilePictureModalContent: React.FC = () => {
  const { closeModal } = useModal();
  const { openSnackbar } = useSnackbar();
  const { user, updateUser } = useUserData();
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setErrorMessage('')
  }, [])

  useEffect(() => {
    newProfilePicture && setErrorMessage('')
  }, [newProfilePicture])

  const handleNewProfilePictureSubmit = async () => {
    if (!newProfilePicture) {
      setErrorMessage('Žádný zvolený obrázek!');
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', newProfilePicture);

    try {
      await axios.post(`/upload-profile-picture/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      updateUser()
      openSnackbar('Obrázek úspěšně nahrán!');
      closeModal()
      setErrorMessage('')
    } catch (error) {
      setErrorMessage('Chyba při nahrávání obrázku :(');
    }
  };

  return (
    <div className="change-profile-picture">
      <h1>Změnit profilový obrázek</h1>
      <FileUploader
        label='Vyberte obrázek'
        file={newProfilePicture}
        setFile={setNewProfilePicture}
        acceptAttributeValue='image/*'
      />
      <ErrorMessage content={errorMessage} />
      <ModalFooter onSubmit={handleNewProfilePictureSubmit} submitButtonLabel='Nahrát obrázek' cancelButtonLabel='Zrušit'/>
    </div>
  )
}
export default ChangeProfilePictureModalContent;
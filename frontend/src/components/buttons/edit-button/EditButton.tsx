import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EditButton.scss'
import { useModal } from '../../../contexts/ModalProvider';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import ErrorMessage from '../../error-message/ErrorMessage';
import ModalFooter from '../../modal/modal-footer/ModalFooter';
import FileUploader from '../file-uploader/FileUploader';
import { useAuth } from '../../../contexts/AuthProvider';

const EditPostModalContent = (props: any) => {
  const [postTitle, setPostTitle] = useState<string>(props.postData.post_title || '')
  const [postDescription, setPostDescription] = useState<string>(props.postData.post_description || '')
  const [postImage, setPostImage] = useState<File | null>(null);
  const { openSnackbar } = useSnackbar();
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { closeModal } = useModal();
  const { protectedHttpClientInit } = useAuth();

  const handlePostDescChange = (e: any) => {
    setPostDescription(e.target.value)
  }

  const handlePostTitleChange = (e: any) => {
    setPostTitle(e.target.value)
  }

  const editPost = async () => {
    if (!postTitle.trim()) return setErrorMessage('Titulek příspěvku nesmí být prázdný!')
    if (!postDescription.trim()) return setErrorMessage('Popisek příspěvku nesmí být prázdný!')

    const formData = new FormData()

    if (postImage) formData.append('post_image', postImage)
    formData.append('post_title', postTitle)
    formData.append('post_description', postDescription)

    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.put(`api/blog-posts/${props.postData._id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        props.getMyPosts()
        openSnackbar("Příspěvek úspěšně uložen!")
      })
      .catch(err => console.error(err))
      setErrorMessage('')
      closeModal();
  }

  return (
  <div className="edit-post-modal-content">
    <div className="edit-post-input">
      <label htmlFor="post-title">Titulek:</label>
      <input
        type="text"
        id='post-title'
        value={postTitle}
        onChange={handlePostTitleChange}
        maxLength={100}
      />
    </div>
    <div className="edit-post-input">
      <label htmlFor="post-description">Popisek:</label>
      <textarea
        value={postDescription}
        onChange={handlePostDescChange}
        name="post-description"
        id="post-description"
        cols={30}
        rows={10}
        maxLength={500}
      />
    </div>
    <FileUploader label='Nahrát obrázek' file={postImage} setFile={setPostImage} acceptAttributeValue='image/*' />
    <ErrorMessage content={errorMessage} />
    <ModalFooter onSubmit={editPost} submitButtonLabel='Uložit' cancelButtonLabel='Zahodit změny'/>
  </div>
  )
}

const EditButton = (props: any) => {
  const { showModal } = useModal();

  const openEditModal = () => {
    showModal(<EditPostModalContent getMyPosts={props.getMyPosts} postData={props.postData} />)
  }

  return (
    <button className="edit-button" onClick={openEditModal}>
      <FontAwesomeIcon icon={faEdit} className='edit-icon' />
    </button>
  )
}
export default EditButton;
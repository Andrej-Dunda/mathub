import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EditButton.scss'
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Modal from '../modal/Modal';
import { ChangeEvent, useState } from 'react';
import axios from 'axios';

const EditButton = (props: any) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [postTitle, setPostTitle] = useState(props.postData.title)
  const [postDescription, setPostDescription] = useState(props.postData.content)
  const [postImage, setPostImage] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(Date.now());

  const handlePostDescChange = (e: any) => {
    setPostDescription(e.target.value)
  }

  const handlePostTitleChange = (e: any) => {
    setPostTitle(e.target.value)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPostImage(files[0]);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false)
  }

  const openEditModal = () => {
    setIsEditModalOpen(true)
    setPostDescription(props.postData.content)
    setPostTitle(props.postData.title)
    setInputKey(Date.now());
  }

  const editPost = async (e: any) => {
    e.preventDefault()

    if (!postTitle.trim()) return alert('Titulek příspěvku nesmí být prázdný!')
    if (!postDescription.trim()) return alert('Popisek příspěvku nesmí být prázdný!')

    const formData = new FormData()

    if (postImage) formData.append('post_image', postImage)
    formData.append('post_id', props.postData.id.toString())
    formData.append('post_title', postTitle)
    formData.append('post_description', postDescription)

    axios.post('/update-blog-post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        props.getMyPosts()
        setIsEditModalOpen(false)
        alert("Příspěvek úspěšně upraven :)")
      })
      .catch(err => console.error(err))
  }

  return (
    <>
      <button className="edit-button" onClick={openEditModal}>
        <FontAwesomeIcon icon={faEdit} className='edit-icon' />
      </button>
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} onSubmit={editPost} submitContent='Uložit' cancelContent='Zahodit změny'>
        <div className="edit-blog-post">
          <div className="edit-post-input">
            <label htmlFor="post-title">Titulek:</label>
            <input
              type="text"
              id='post-title'
              value={postTitle}
              onChange={handlePostTitleChange}
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
            />
          </div>
          <div className="edit-post-input">
            <label htmlFor="post-image-input">Obrázek k příspěvku:</label>
            <input id='post-image-input' type="file" accept="image/*" key={inputKey} onChange={handleImageChange} />
          </div>
        </div>
      </Modal>
    </>
  )
}
export default EditButton;
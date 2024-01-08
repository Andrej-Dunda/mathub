import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DeleteButton.scss'
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../modal/Modal';
import axios from 'axios';
import { useState } from 'react';

const DeleteButton = (props: any) => {
  const [isDeleteBlogPostModalOpen, setIsDeleteBlogPostModalOpen] = useState<boolean>(false)

  const closeDeleteBlogPostModal = () => {
    setIsDeleteBlogPostModalOpen(false)
  }

  const openDeleteBlogPostModal = () => {
    setIsDeleteBlogPostModalOpen(true)
  }

  const deleteBlogPost = () => {
    axios.post(`/delete-blog-post/${props.postId}`)
    .then(() => {
      setIsDeleteBlogPostModalOpen(false)
      props.getMyPosts()
      alert('Příspěvek úspěšně smazán.')
    })
    .catch(err => console.error(err))
  }

  return (
    <>
      <button onClick={openDeleteBlogPostModal} className="delete-button">
        <FontAwesomeIcon icon={faTrash} className='delete-icon' />
      </button>
      <Modal isOpen={isDeleteBlogPostModalOpen} onClose={closeDeleteBlogPostModal} onSubmit={deleteBlogPost} submitContent='Smazat' cancelContent='Zrušit'>
        <h2 className="h2">Přejete si opravdu smazat tento příspěvek?</h2>
        <span>Tuto akci již nelze vrátit zpět!</span>
      </Modal>
    </>
  )
}
export default DeleteButton;
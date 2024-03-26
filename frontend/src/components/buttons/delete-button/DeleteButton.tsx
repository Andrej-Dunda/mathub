import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DeleteButton.scss'
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useModal } from '../../../contexts/ModalProvider';
import ModalFooter from '../../modal/modal-footer/ModalFooter';
import { useAuth } from '../../../contexts/AuthProvider';

const DeleteBlogPostModalContent = (props: any) => {
  const { openSnackbar } = useSnackbar();
  const { closeModal } = useModal();
  const { protectedHttpClientInit } = useAuth();

  const deleteBlogPost = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.delete(`/api/delete-blog-post/${props.postId}`)
    .then(() => {
      props.getMyPosts()
      openSnackbar('Příspěvek úspěšně smazán!')
    })
    .catch(err => console.error(err))
    closeModal();
  }

  return (
    <div className="delete-blog-post-modal-content">
      <h2 className="h2">Přejete si opravdu smazat tento příspěvek?</h2>
      <span>Tuto akci již nelze vrátit zpět!</span>
      <ModalFooter onSubmit={deleteBlogPost} submitButtonLabel='Smazat' cancelButtonLabel='Zrušit'/>
    </div>
  )
}

const DeleteButton = (props: any) => {
  const { showModal } = useModal();

  const openDeleteBlogPostModal = () => {
    showModal(<DeleteBlogPostModalContent getMyPosts={props.getMyPosts} postId={props.postId} />)
  }

  return (
    <button onClick={openDeleteBlogPostModal} className="delete-button">
      <FontAwesomeIcon icon={faTrash} className='delete-icon' />
    </button>
  )
}
export default DeleteButton;
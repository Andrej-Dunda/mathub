import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EditButton.scss'
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const EditButton = (props: any) => {
  return (
    <button className="edit-button">
      <FontAwesomeIcon icon={faEdit} className='edit-icon' />
    </button>
  )
}
export default EditButton;
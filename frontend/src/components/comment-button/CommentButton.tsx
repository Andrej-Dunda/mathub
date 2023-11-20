import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './CommentButton.scss'
import { faComment } from '@fortawesome/free-solid-svg-icons'

const CommentButton = (props: any) => {
  return (
    <button className={`comment-button ${props.showComments && 'active'}`} onClick={() => props.setShowComments(!props.showComments)}>
      <span>{props.commentsCount}</span>
      <FontAwesomeIcon icon={faComment} className='comment-icon'/>
    </button>
  )
}
export default CommentButton;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './CommentButton.scss'
import { faComment } from '@fortawesome/free-solid-svg-icons'

const CommentButton = (props: any) => {
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  return (
    <button className={`comment-button ${props.showComments && 'active'}`} onClick={() => props.setShowComments(!props.showComments)}>
      <span>{props.commentsCount}</span>
      <FontAwesomeIcon icon={faComment} className='comment-icon' color={grayscale100} />
    </button>
  )
}
export default CommentButton;
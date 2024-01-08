import './LikeButton.scss'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useUserData } from '../../../contexts/UserDataProvider'

const LikeButton = (props: any) => {
  const { user } = useUserData();
  const [liked, setLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)

  useEffect(() => {
    getLikes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getLikes = () => {
    axios.get(`/post-likes/${props.postId}`)
    .then(res => {
      const isLiked = res.data.some((subArray: any) => subArray.includes(user.id));
      setLiked(isLiked)
      setLikesCount(res.data.length)
    })
    .catch(err => console.error(err))
  }

  const onLikeButtonClick = () => {
    axios({
      method: 'POST',
      url: '/toggle-post-like',
      data: {
        post_id: props.postId,
        user_id: user.id
      }
    })
    .then(res => {
      getLikes()
    })
    .catch(err => console.error(err))
  }

  return (
    <button className={`like-button ${liked && 'liked'}`} onClick={onLikeButtonClick}>
      <span>{likesCount}</span>
      <FontAwesomeIcon icon={faThumbsUp} inverse={liked} />
    </button>
  )
}
export default LikeButton;
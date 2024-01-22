import './LikeButton.scss'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { useUserData } from '../../../contexts/UserDataProvider'
import { useAuth } from '../../../contexts/AuthProvider'

const LikeButton = (props: any) => {
  const { user } = useUserData();
  const { protectedHttpClientInit } = useAuth();
  const [liked, setLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)

  useEffect(() => {
    getLikes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getLikes = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get(`/api/post-likes/${props.postId}`)
      .then(res => {
        const isLiked = res.data.some((liker: any) => liker.user_id === user._id);
        setLiked(isLiked)
        setLikesCount(res.data.length)
      })
      .catch(err => console.error(err))
  }

  const onLikeButtonClick = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post('/api/toggle-post-like', {
      post_id: props.postId,
      user_id: user._id
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
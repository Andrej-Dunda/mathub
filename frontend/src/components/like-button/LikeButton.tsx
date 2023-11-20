/* eslint-disable react-hooks/exhaustive-deps */
import './LikeButton.scss'
import { useContext, useEffect, useState } from 'react'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { UserContext } from '../../App'

const LikeButton = (props: any) => {
  const userInfo = useContext(UserContext)
  const [liked, setLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)

  useEffect(() => {
    getLikes()
  }, [])

  const getLikes = () => {
    axios.get(`/post-likes/${props.postId}`)
    .then(res => {
      const isLiked = res.data.some((subArray: any) => subArray.includes(userInfo.id));
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
        user_id: userInfo.id
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
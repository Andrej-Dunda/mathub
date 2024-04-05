import { useEffect, useState } from 'react';
import './Comment.scss'
import ProfilePicture from '../profile-picture/ProfilePicture';
import httpClient from '../../utils/httpClient';
import { useUserData } from '../../contexts/UserDataProvider';
import { useNav } from '../../contexts/NavigationProvider';
import { normalizeDateHours } from '../../utils/normalizeDate';

const Comment = (props: any) => {
  const { user } = useUserData();
  const { toUserProfile, toMyProfile } = useNav();
  const [authorName, setAuthorName] = useState('')

  const commentContent = {
    author_id: props.commentContent.author_id,
    comment: props.commentContent.comment,
    comment_time: normalizeDateHours(props.commentContent.comment_time)
  }

  useEffect(() => {
    httpClient.get(`/api/users/${commentContent.author_id}`)
    .then(res => {
      setAuthorName(`${res.data.first_name} ${res.data.last_name}`)
    })
    .catch(err => console.error(err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentContent.author_id])

  const redirectToUserProfile = () => {
    if (commentContent.author_id === user._id) toMyProfile()
    else toUserProfile(commentContent.author_id)
  }

  return (
    <div className='comment'>
      <div className="comment-header">
        <ProfilePicture className='xxsmall radius-100' userId={commentContent.author_id} />
        <div className="author-and-comment-time">
          <span className='comment-author' onClick={redirectToUserProfile}>{authorName}</span>
          <span className='comment-time'>{commentContent.comment_time}</span>
        </div>
      </div>
      <div className="comment-body">
        <span className='comment-text'>{commentContent.comment}</span>
      </div>
    </div>
  )
}
export default Comment;
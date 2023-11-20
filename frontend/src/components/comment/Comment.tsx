import { useEffect, useState } from 'react';
import './Comment.scss'
import axios from 'axios';
import ProfilePicture from '../profile-picture/ProfilePicture';

const Comment = (props: any) => {
  const [authoName, setAuthorName] = useState('')
  const rawPostDate = new Date(props.commentContent[2])
  const dayOfMonth = rawPostDate.getDate();
  const month = rawPostDate.getMonth() + 1;
  const hour = rawPostDate.getHours();
  const minute = rawPostDate.getMinutes();
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  const customDateFormat = `${dayOfMonth}. ${addLeadingZero(month)}. ${hour}:${addLeadingZero(minute)}`;

  const commentContent = {
    commentator_id: props.commentContent[0],
    comment: props.commentContent[1],
    comment_time: customDateFormat
  }

  useEffect(() => {
    axios.get(`/user/${commentContent.commentator_id}`)
    .then(res => {
      setAuthorName(`${res.data.user[2]} ${res.data.user[3]}`)
    })
    .catch(err => console.error(err))
  }, [commentContent.commentator_id])


  return (
    <div className='comment'>
      <div className="comment-header">
        <div className="profile-picture">
          <ProfilePicture className='xsmall radius-100' userId={commentContent.commentator_id} />
        </div>
        <div className="author-and-comment-time">
          <span className='comment-author'>{authoName}</span>
          <span>{commentContent.comment_time}</span>
        </div>
      </div>
      <div className="comment-body">
        <span className='comment-text'>{commentContent.comment}</span>
      </div>
    </div>
  )
}
export default Comment;
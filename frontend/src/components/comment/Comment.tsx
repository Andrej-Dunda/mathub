import { useEffect, useState } from 'react';
import './Comment.scss'
import ProfilePicture from '../profile-picture/ProfilePicture';
import httpClient from '../../utils/httpClient';

const Comment = (props: any) => {
  const [authorName, setAuthorName] = useState('')
  const rawPostDate = new Date(props.commentContent.comment_time)
  const rawPostDateObj = new Date(rawPostDate);
  const dayOfMonth = rawPostDateObj.getDate();
  const month = rawPostDate.getMonth() + 1;
  const hour = rawPostDate.getHours();
  const minute = rawPostDate.getMinutes();
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  const customDateFormat = `${dayOfMonth}. ${month}. v ${hour}:${addLeadingZero(minute)}`;

  const commentContent = {
    author_id: props.commentContent.author_id,
    comment: props.commentContent.comment,
    comment_time: customDateFormat
  }

  useEffect(() => {
    httpClient.get(`/api/user/${commentContent.author_id}`)
    .then(res => {
      setAuthorName(`${res.data.first_name} ${res.data.last_name}`)
    })
    .catch(err => console.error(err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentContent.author_id])


  return (
    <div className='comment'>
      <div className="comment-header">
        <ProfilePicture className='xsmall radius-100' userId={commentContent.author_id} />
        <div className="author-and-comment-time">
          <span className='comment-author'>{authorName}</span>
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
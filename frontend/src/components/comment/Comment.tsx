import { useEffect, useState } from 'react';
import './Comment.scss'
import axios from 'axios';
import ProfilePicture from '../profile-picture/ProfilePicture';

const Comment = (props: any) => {
  const [authorName, setAuthorName] = useState('')
  const rawPostDate = new Date(props.commentContent[2])
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  const dayOfMonth = rawPostDate.getDate();
  // const month = czechMonthNames[rawPostDate.getMonth()];
  const month = rawPostDate.getMonth() + 1;
  const hour = rawPostDate.getHours();
  const minute = rawPostDate.getMinutes();
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  const customDateFormat = `${dayOfMonth}. ${month}. v ${hour}:${addLeadingZero(minute)}`;

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
        <ProfilePicture className='xsmall radius-100' userId={commentContent.commentator_id} />
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
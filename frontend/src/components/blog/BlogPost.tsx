import './BlogPost.scss'
import LikeButton from '../like-button/LikeButton'
import ProfilePicture from '../profile-picture/ProfilePicture'
import Comment from '../comment/Comment'
import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { UserContext } from '../../App'

const BlogPost = (props: any) => {
  const userInfo = useContext(UserContext)
  const [userName, setUserName] = useState<string>('')
  const rawPostDate = new Date(props.postData[2])
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = rawPostDate.getDate();
  const monthName = czechMonthNames[rawPostDate.getMonth()];
  const hour = rawPostDate.getHours();
  const minute = rawPostDate.getMinutes();
  const customDateFormat = `${dayOfMonth}. ${monthName} v ${hour}:${minute}`;
  const postData = {
    id: props.postData[0],
    user_id: props.postData[1],
    time: customDateFormat,
    title: props.postData[3],
    content: props.postData[4],
    image: props.postData[5],
    likes: 12
  }
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState<string>('')

  useEffect(() => {
    axios.get(`/user/${postData.user_id}`)
    .then(res => {
      setUserName(res.data.user[2] + ' ' + res.data.user[3])
    })
    .catch((err) => console.error(err))
  }, [postData.user_id])

  useEffect(() => {
    getComments()
  }, [])

  const getComments = () => {
    axios.get(`/comments/${postData.id}`)
    .then(res => {
      setComments(res.data)
    })
    .catch(err => console.error(err))
  }

  const handleCommentKeyPress = (e: any) => {
    if (e.key === 'Enter') submitComment();
  }

  const handleCommentChange = (e: any) => {
    setNewComment(e.target.value)
  }

  const submitComment = () => {
    newComment.trim() && axios({
      url: '/add-comment',
      method: 'POST',
      data: {
        post_id: postData.id,
        commenter_id: userInfo.id,
        comment: newComment
      }
    })
    .then((res) => {
      setNewComment('')
      getComments()
    })
    .catch(err => console.error(err))
  }

  return (
    <div className="blog-post">
      <main className="blog-post-main">
      <div className="blog-post-header">
        <div className="blog-info">
          <div className="user-profile-picture">
            <ProfilePicture className='post-size radius-100 border' userId={postData.user_id} />
          </div>
          <div className="user-name-and-post-time">
            <h3 className='user-name h3'>{userName}</h3>
            <span className='blog-post-time'>{postData.time}</span>
          </div>
          <div className="blog-post-likes">
            <LikeButton postId={postData.id} />
          </div>
        </div>
        <hr />
        <h4 className='h4'>{postData.title}</h4>
      </div>
      <div className="blog-post-body">
        <img
          className='post-image'
          src={`http://127.0.0.1:5000/post-image/${postData.image}`}
          alt=""
        />
        <p className='blog-post-content'>{postData.content}</p>
      </div>
      </main>
      <aside className="blog-post-aside blog-post-comments">
        <div className="comments-header">
          <h3 className="h3">Komentáře</h3>
          <FontAwesomeIcon icon={faComment} className='comment-icon'/>
        </div>
        <div className="comments">
          {
            !comments ? (
              <span>Žádné komentáře</span>
            ) : (
              comments.map((comment, index) => {
                return <Comment key={index} commentContent={comment} />
              })
            )
          }
        </div>
        <div className="comment-input-wrapper">
          <input
            type="text"
            className='comment-input'
            placeholder='Přidat komentář...'
            value={newComment}
            onChange={handleCommentChange}
            onKeyDown={handleCommentKeyPress}
          />
          <button className='submit-comment' onClick={submitComment}>
            <FontAwesomeIcon icon={faPaperPlane} style={{color: "#ffffff",}} />
          </button>
        </div>
      </aside>
    </div>
  )
}
export default BlogPost;
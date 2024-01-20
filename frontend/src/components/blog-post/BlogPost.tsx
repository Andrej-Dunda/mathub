import './BlogPost.scss'
import LikeButton from '../buttons/like-button/LikeButton'
import ProfilePicture from '../profile-picture/ProfilePicture'
import Comment from '../comment/Comment'
import { useEffect, useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import CommentButton from '../buttons/comment-button/CommentButton'
import EditButton from '../buttons/edit-button/EditButton'
import DeleteButton from '../buttons/delete-button/DeleteButton'
import { useUserData } from '../../contexts/UserDataProvider'
import TextParagraph from '../text-paragraph/TextParagraph'
import httpClient from '../../utils/httpClient'
import { iPost } from '../../interfaces/blog-interfaces'

const BlogPost = (props: any) => {
  const { user } = useUserData();
  const [userName, setUserName] = useState<string>('')
  const rawPostDate = new Date(props.postData.post_time)
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  // Custom format for Czech date string
  const dayOfMonth = rawPostDate.getDate();
  const monthName = czechMonthNames[rawPostDate.getMonth()];
  const hour = rawPostDate.getHours();
  const minute = rawPostDate.getMinutes();
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  const customDateFormat = `${dayOfMonth}. ${monthName} v ${hour}:${addLeadingZero(minute)}`;
  const postData: iPost = {
    _id: props.postData._id,
    author_id: props.postData.author_id,
    post_time: customDateFormat,
    post_title: props.postData.post_title,
    post_description: props.postData.post_description,
    post_image: props.postData.post_image ? props.postData.post_image : null
  }
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState<string>('')
  const [showComments, setShowComments] = useState<boolean>(false)
  const postContentRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();
  const [height, setHeight] = useState<number>(postContentRef.current?.getBoundingClientRect().height || 0);

  useEffect(() => {
    getComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [showComments]);

  useEffect(() => {
    httpClient.get(`/api/user/${postData.author_id}`)
      .then(res => {
        setUserName(res.data.first_name + ' ' + res.data.last_name)
      })
      .catch((err) => console.error(err))
  }, [postData.author_id])

  const getComments = () => {
    httpClient.get(`/api/comments/${postData._id}`)
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
    newComment.trim() && httpClient.post('/api/add-comment', {
      post_id: postData._id,
      commenter_id: user._id,
      comment: newComment
    })
      .then(() => {
        setNewComment('')
        getComments()
        if (commentsRef.current) commentsRef.current.scrollTop = 0;
      })
      .catch(err => console.error(err))
  }

  // Function to update height off the comment section
  const updateHeight = () => {
    if (postContentRef.current) {
      // Using getBoundingClientRect to get full outer dimensions
      const rect = postContentRef.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  };

  return (
    <div className={`blog-post ${!showComments && 'no-comments'}`}>
      <main className={`blog-post-main ${showComments && 'border-right-grey'}`} ref={postContentRef} >
        <div className="blog-post-header">
          <div className="blog-info">
            <ProfilePicture className='post-size radius-100 border box-shadow-dark' userId={postData.author_id} />
            <div className="user-name-and-post-time">
              <h5 className='user-name'>{userName}</h5>
              <span className='blog-post-time'>{postData.post_time}</span>
            </div>
            <div className="blog-post-buttons">
              <LikeButton postId={postData._id} />
              {!props.blogFormat && <CommentButton showComments={showComments} setShowComments={setShowComments} commentsCount={comments.length} />}
              {props.blogFormat && <EditButton postData={postData} getMyPosts={props.getMyPosts} />}
              {props.blogFormat && <DeleteButton postId={postData._id} getMyPosts={props.getMyPosts} />}
            </div>
          </div>
        </div>
        <div className="blog-post-body">
          <h5 className='h4 blog-post-heading'>{postData.post_title}</h5>
          <TextParagraph className='blog-post-content' text={postData.post_description} characterLimit={185} onShowMoreToggle={updateHeight} />
          {
            postData.post_image ?
              <div className="post-image-wrapper">
                <img
                  className='post-image'
                  src={`/post-image/${postData.post_image}`}
                  alt=""
                />
              </div>
              : null
          }
        </div>
      </main>
      <aside className={`blog-post-aside blog-post-comments ${!showComments && 'comments-hidden'}`} ref={commentSectionRef} style={{ height: `${height}px` }} >
        <div className="comments-header">
          <h3 className="h3">Komentáře</h3>
          <FontAwesomeIcon icon={faComment} className='comment-icon' />
        </div>
        <div className="comments" ref={commentsRef} >
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
            <FontAwesomeIcon className='submit-icon' icon={faPaperPlane} color={grayscale100} />
          </button>
        </div>
      </aside>
    </div>
  )
}
export default BlogPost;
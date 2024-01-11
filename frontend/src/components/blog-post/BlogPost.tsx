import './BlogPost.scss'
import LikeButton from '../buttons/like-button/LikeButton'
import ProfilePicture from '../profile-picture/ProfilePicture'
import Comment from '../comment/Comment'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import CommentButton from '../buttons/comment-button/CommentButton'
import EditButton from '../buttons/edit-button/EditButton'
import DeleteButton from '../buttons/delete-button/DeleteButton'
import { useUserData } from '../../contexts/UserDataProvider'
import TextParagraph from '../text-paragraph/TextParagraph'

const BlogPost = (props: any) => {
  const { user } = useUserData();
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
  const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);
  const customDateFormat = `${dayOfMonth}. ${monthName} v ${hour}:${addLeadingZero(minute)}`;
  const postData = {
    id: props.postData[0],
    user_id: props.postData[1],
    time: customDateFormat,
    title: props.postData[3],
    content: props.postData[4],
    image: props.postData[5]
  }
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState<string>('')
  const [showComments, setShowComments] = useState<boolean>(false)
  const postContentRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0)
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();
  const [keyUpdate, setKeyUpdate] = useState<number>(new Date().getTime());

  useEffect(() => {
    // Function to update height
    const updateHeight = () => {
      if (postContentRef.current) {
        // Using getBoundingClientRect to get full outer dimensions
        const rect = postContentRef.current.getBoundingClientRect();
        setHeight(rect.height);
      }
    };

    // Delaying the update to ensure content is loaded
    setTimeout(updateHeight, 100);

    window.addEventListener('resize', updateHeight);

    // Cleanup
    return () => window.removeEventListener('resize', updateHeight);
  }, [showComments, keyUpdate]);

  useEffect(() => {
    axios.get(`/user/${postData.user_id}`)
      .then(res => {
        setUserName(res.data.user[2] + ' ' + res.data.user[3])
      })
      .catch((err) => console.error(err))
  }, [postData.user_id])

  useEffect(() => {
    getComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        commenter_id: user.id,
        comment: newComment
      }
    })
      .then((res) => {
        setNewComment('')
        getComments()
        if (commentsRef.current) commentsRef.current.scrollTop = 0;
      })
      .catch(err => console.error(err))
  }

  const updateCommentsSectionHeight = () => {
    setKeyUpdate(new Date().getTime());
  }

  return (
    <div className={`blog-post ${!showComments && 'no-comments'}`}>
      <main className={`blog-post-main ${showComments && 'border-right-grey'}`} ref={postContentRef} >
        <div className="blog-post-header">
          <div className="blog-info">
            <ProfilePicture className='post-size radius-100 border box-shadow-dark' userId={postData.user_id} />
            <div className="user-name-and-post-time">
              <h5 className='user-name'>{userName}</h5>
              <span className='blog-post-time'>{postData.time}</span>
            </div>
            <div className="blog-post-buttons">
              <LikeButton postId={postData.id} />
              {!props.blogFormat && <CommentButton showComments={showComments} setShowComments={setShowComments} commentsCount={comments.length} />}
              {props.blogFormat && <EditButton postData={postData} getMyPosts={props.getMyPosts} />}
              {props.blogFormat && <DeleteButton postId={postData.id} getMyPosts={props.getMyPosts} />}
            </div>
          </div>
        </div>
        <div className="blog-post-body">
          <h5 className='h4 blog-post-heading'>{postData.title}</h5>
          <TextParagraph className='blog-post-content' text={postData.content} characterLimit={185} onShowMoreToggle={updateCommentsSectionHeight} />
          {
            postData.image &&
            <div className="post-image-wrapper">
              <img
                className='post-image'
                src={`/post-image/${postData.image}`}
                alt=""
              />
            </div>
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
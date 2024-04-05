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
import { iBlogPost } from '../../interfaces/blog-interfaces'
import { useNav } from '../../contexts/NavigationProvider'
import { normalizeDateHours } from '../../utils/normalizeDate'

const BlogPost = (props: any) => {
  const { user } = useUserData();
  const [userName, setUserName] = useState<string>('')
  const postData: iBlogPost = {
    _id: props.postData._id,
    author_id: props.postData.author_id,
    post_time: normalizeDateHours(props.postData.post_time),
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
  const { toUserProfile, toMyProfile } = useNav();

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
    httpClient.get(`/api/users/${postData.author_id}`)
      .then(res => {
        setUserName(res.data.first_name + ' ' + res.data.last_name)
      })
      .catch((err) => console.error(err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postData.author_id])

  const getComments = () => {
    httpClient.get(`/api/blog-posts/${postData._id}/comments`)
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

  const submitComment = async () => {
    newComment.trim() && httpClient.post(`/api/blog-posts/${postData._id}/comments`, {
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

  const redirectToUserProfile = () => {
    if (postData.author_id === user._id) toMyProfile()
    else toUserProfile(postData.author_id)
  }

  return (
    <div className={`blog-post ${!showComments && 'no-comments'}`}>
      <main className={`blog-post-main ${showComments && 'border-right-grey'}`} ref={postContentRef} >
        <div className="blog-post-header">
          <div className="blog-info">
            <ProfilePicture className='post-size radius-100 border box-shadow-dark' userId={postData.author_id} />
            <div className="user-name-and-post-time">
              <h5
                className='user-name'
                onClick={redirectToUserProfile}
              >{userName}</h5>
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
                  src={`api/images/${postData.post_image}`}
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
            maxLength={200}
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
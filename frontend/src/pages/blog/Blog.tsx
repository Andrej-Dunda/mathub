import './Blog.scss'
import { useEffect, useRef, useState } from "react";
import BlogPost from "../../components/blog-post/BlogPost";
import FileUploader from '../../components/buttons/file-uploader/FileUploader';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import { useUserData } from '../../contexts/UserDataProvider';
import { useSnackbar } from '../../contexts/SnackbarProvider';
import { useNav } from '../../contexts/NavigationProvider';
import { useAuth } from '../../contexts/AuthProvider';

const Blog = () => {
  const { user } = useUserData();
  const { openSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<any[]>([])
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')
  const [postImage, setPostImage] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('')
  const myPostsSectionRef = useRef<HTMLHRElement>(null);
  const { setActiveLink } = useNav();
  const { protectedHttpClientInit } = useAuth();

  useEffect(() => {
    getMyPosts()
    setActiveLink('/blog')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getMyPosts = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.get(`/api/blog-posts/my-posts`)
      .then(res => {
        setPosts(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const submitNewPost = async (e: any) => {
    e.preventDefault()

    if (!postTitle.trim()) return setErrorMessage('Titulek příspěvku nesmí být prázdný!')
    if (!postDescription.trim()) return setErrorMessage('Popisek příspěvku nesmí být prázdný!')

    const formData = new FormData()

    if (postImage) {
      formData.append('post_image', postImage)
    }
    formData.append('user_id', user._id.toString())
    formData.append('post_title', postTitle)
    formData.append('post_description', postDescription)

    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post('/api/users/blog-posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        getMyPosts()
        setPostDescription('')
        setPostTitle('')
        setPostImage(null)
        openSnackbar("Příspěvek úspěšně zveřejněn!")
        setErrorMessage('')
        myPostsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(err => console.error(err))
  }

  const handlePostDescChange = (e: any) => {
    setPostDescription(e.target.value)
  }

  const handlePostTitleChange = (e: any) => {
    setPostTitle(e.target.value)
  }

  return (
    <div className="blog">
      <div className="my-posts">
        <h2 className="h2">Nový Příspěvek</h2>
        <div className="new-post-wrapper">
          <div className="new-blog-post">
            <div className="new-post-input">
              <label htmlFor="post-title">Titulek:</label>
              <input
                type="text"
                id='post-title'
                value={postTitle}
                onChange={handlePostTitleChange}
                maxLength={100}
              />
            </div>
            <div className="new-post-input">
              <label htmlFor="post-description">Popisek:</label>
              <textarea
                value={postDescription}
                onChange={handlePostDescChange}
                name="post-description"
                id="post-description"
                cols={30}
                rows={10}
                maxLength={500}
              />
            </div>
            <div className="new-post-input">
              <FileUploader
                label='Nahrát obrázek'
                acceptAttributeValue='image/*'
                file={postImage}
                setFile={setPostImage}
              />
            </div>
            <ErrorMessage content={errorMessage} />
            <button className="submit-post-button" onClick={submitNewPost}>Zveřejnit příspěvek</button>
          </div>
        </div>
        <hr ref={myPostsSectionRef} />
        <h2 className="h2">Moje Příspěvky</h2>
        <div className="old-posts">
          {
            posts.length > 0 ? posts.map((post, index) => {
              return (
                <BlogPost
                  key={index}
                  postData={post}
                  showComments={false}
                  blogFormat={true}
                  getMyPosts={getMyPosts}
                />
              )
            }) : (
              <span className='no-posts'>Zatím nemáte žádné příspěvky :(</span>
            )
          }
        </div>
      </div>
    </div>
  )
}
export default Blog;
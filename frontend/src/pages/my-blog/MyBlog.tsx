import './MyBlog.scss'
import axios from "axios";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import BlogPost from "../../components/blog-post/BlogPost";

const MyBlog = () => {
  const userInfo = useContext(UserContext)
  const [myPosts, setMyPosts] = useState([])
  const [postTitle, setPostTitle] = useState('')
  const [postDescription, setPostDescription] = useState('')
  const [postImage, setPostImage] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(Date.now());

  useEffect(() => {
    getMyPosts()
  }, [])

  const getMyPosts = () => {
    axios({
      method: 'GET',
      url: `/get-my-posts/${userInfo.id}`
    })
      .then(res => {
        setMyPosts(res.data)
      })
      .catch(err => console.error(err))
  }

  const submitNewPost = async (e: any) => {
    e.preventDefault()

    if (!postTitle.trim()) return alert('Titulek příspěvku nesmí být prázdný!')
    if (!postDescription.trim()) return alert('Popisek příspěvku nesmí být prázdný!')

    const formData = new FormData()

    if (postImage) {
      formData.append('post_image', postImage)
    }
    formData.append('user_id', userInfo.id.toString())
    formData.append('post_title', postTitle)
    formData.append('post_description', postDescription)

    axios.post('/new-blog-post', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        getMyPosts()
        setPostDescription('')
        setPostTitle('')
        setPostImage(null)
        setInputKey(Date.now());
        alert("Příspěvek úspěšně zveřejněn :)")
      })
      .catch(err => console.error(err))
  }

  const handlePostDescChange = (e: any) => {
    setPostDescription(e.target.value)
  }

  const handlePostTitleChange = (e: any) => {
    setPostTitle(e.target.value)
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setPostImage(files[0]);
    }
  };

  return (
    <div className="my-blog">
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
              />
            </div>
            <div className="new-post-input">
              <label htmlFor="post-image-input">Obrázek k příspěvku:</label>
              <input id='post-image-input' type="file" accept="image/*" key={inputKey} onChange={handleImageChange} />
            </div>
            <button className="submit-post-button" onClick={submitNewPost}>Zveřejnit příspěvek</button>
          </div>
        </div>
        <hr />
        <h2 className="h2">Moje Příspěvky</h2>
        <div className="old-posts">
          {
            myPosts.length > 0 ? myPosts.map((post, index) => {
              return <BlogPost key={index} postData={post} showComments={false} myBlogFormat={true} getMyPosts={getMyPosts} />
            }) : (
              <span className='no-posts'>Zatím nemáte žádné příspěvky :(</span>
            )
          }
        </div>
      </div>
    </div>
  )
}
export default MyBlog;
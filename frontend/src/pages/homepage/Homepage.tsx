import React, { useEffect, useState } from "react";
import './Homepage.scss'
import axios from "axios";
import BlogPost from "../../components/blog-post/BlogPost";

const Homepage = () => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    axios.get('/posts')
    .then(res => {
      setPosts(res.data)
    })
  }, [])  

  return (
    <div className="homepage">
      <header className="homepage-header">
      </header>
      <main className="homepage-body">
        {
          posts && posts.map((post, index) => {
            return (
              <BlogPost key={index} postData={post} showComments={false} myBlogFormat={false} />
            )
          })
        }
      </main>
    </div>
  )
}
export default Homepage;
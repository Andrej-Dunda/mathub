import React, { useEffect, useState } from "react";
import './Homepage.scss'
import axios from "axios";
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";

const Homepage = () => {
  const [posts, setPosts] = useState([])
  const { setActiveLink } = useNav();

  useEffect(() => {
    setActiveLink('home')
    axios.get('/posts')
    .then(res => {
      setPosts(res.data)
    })
  }, [setActiveLink])  

  return (
    <div className="homepage">
      <header className="homepage-header">
      </header>
      <main className="homepage-body">
        {
          posts && posts.map((post, index) => {
            return (
              <BlogPost key={index} postData={post} showComments={false} blogFormat={false} />
            )
          })
        }
      </main>
    </div>
  )
}
export default Homepage;
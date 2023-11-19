import React, { useEffect, useState } from "react";
import './Homepage.scss'
import axios from "axios";
import BlogPost from "../components/blog/BlogPost";

const Homepage = (props: any) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    axios.get('/posts')
    .then(res => {
      console.log(res.data)
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
              <BlogPost key={index} postData={post} />
            )
          })
        }
      </main>
    </div>
  )
}
export default Homepage;
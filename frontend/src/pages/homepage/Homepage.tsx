import React, { useEffect, useState } from "react";
import './Homepage.scss'
import axios from "axios";
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";
import { iPost } from "../../interfaces/blog-interfaces";

const Homepage = () => {
  const [posts, setPosts] = useState([])
  const { setActiveLink } = useNav();
  const [neo4jPost, setNeo4jPost] = useState<iPost>()

  useEffect(() => {
    setActiveLink('home')
    // axios.get('/posts')
    // .then(res => {
    //   setPosts(res.data)
    // })
    // .catch((error: any) => {
    //   if (error.response) {
    //     console.error(error.response)
    //     console.error(error.response.status)
    //     console.error(error.response.headers)
    //   }
    // })

    axios.get('/neo4j')
    .then(res => {
      setNeo4jPost(res.data[0].post)
      console.log(res.data[0].post)
      console.log(new Date())
    })
    .catch((error: any) => {
      if (error.response) {
        console.error(error.response)
        console.error(error.response.status)
        console.error(error.response.headers)
      }
    })
  }, [setActiveLink])  

  return (
    <div className="homepage">
      <header className="homepage-header">
      </header>
      <main className="homepage-body">
        {
          neo4jPost && (
            <BlogPost postData={[
              neo4jPost._id,
              2,
              neo4jPost.post_time,
              neo4jPost.post_title,
              neo4jPost.post_description,
              neo4jPost.post_image
            
            ]} showComments={false} blogFormat={false} />
          )
        }
        {/* {
          posts && posts.map((post, index) => {
            return (
              <BlogPost key={index} postData={post} showComments={false} blogFormat={false} />
            )
          })
        } */}
      </main>
    </div>
  )
}
export default Homepage;
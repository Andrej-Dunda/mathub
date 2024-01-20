import { useEffect, useState } from "react";
import './Homepage.scss'
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";
import { iPost } from "../../interfaces/blog-interfaces";
import httpClient from "../../utils/httpClient";

const Homepage = () => {
  const [posts, setPosts] = useState<iPost[]>([])
  const { setActiveLink } = useNav();

  useEffect(() => {
    setActiveLink('/')
    httpClient.get('/api/posts')
    .then(res => {
      setPosts(res.data)
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
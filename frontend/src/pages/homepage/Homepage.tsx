import { useEffect, useState } from "react";
import './Homepage.scss'
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";
import { iPost } from "../../interfaces/blog-interfaces";
import httpClient from "../../utils/httpClient";
import { useAuth } from "../../contexts/AuthProvider";

const Homepage = () => {
  const [posts, setPosts] = useState<iPost[]>([])
  const { setActiveLink } = useNav();
  const { updateIsLoggedIn } = useAuth();

  useEffect(() => {
    setActiveLink('/')
    if (!updateIsLoggedIn()) return
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
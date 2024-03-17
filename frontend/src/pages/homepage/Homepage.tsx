import { useEffect, useState } from "react";
import './Homepage.scss'
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";
import { iBlogPost } from "../../interfaces/blog-interfaces";
import httpClient from "../../utils/httpClient";
import MaterialPost from "../../components/material-post/MaterialPost";
import { iSubject } from "../../interfaces/materials-interface";

interface iPost {
  date_created: string;
  type: string;
  post: iSubject | iBlogPost;
}

const Homepage = () => {
  const [posts, setPosts] = useState<iPost[]>([])
  const { setActiveLink } = useNav();

  useEffect(() => {
    setActiveLink('/')
    httpClient.get('/api/posts')
    .then(res => {
      // setPosts(res.data.sort((a: iPost, b: iPost) => (new Date(a.date_created).toString()).localeCompare(new Date(b.date_created).toString())))
      setPosts(res.data)
      console.log(res.data)
    })
    .catch(err => console.error(err))
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
              <div key={index}>
                {
                  post.type === 'blog' ? (
                    <BlogPost postData={post.post as iBlogPost} showComments={false} blogFormat={false} />
                  ) : (
                    <MaterialPost subject={post.post as iSubject} />
                  )
                }
              </div>
            )
          })
        }
      </main>
    </div>
  )
}
export default Homepage;
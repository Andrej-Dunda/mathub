import { useEffect, useState } from "react";
import './Homepage.scss'
import BlogPost from "../../components/blog-post/BlogPost";
import { useNav } from "../../contexts/NavigationProvider";
import { iPost } from "../../interfaces/blog-interfaces";
import httpClient from "../../utils/httpClient";
import MaterialPost from "../../components/material-post/MaterialPost";
import { useUserData } from "../../contexts/UserDataProvider";
import { iSubject } from "../../interfaces/materials-interface";

const Homepage = () => {
  const [posts, setPosts] = useState<iPost[]>([])
  const { setActiveLink } = useNav();
  const { user } = useUserData();
  const [testSubject, setTestSubject] = useState<iSubject>({
    _id: '',
    author_id: '',
    date_created: '2024-03-12T14:50:41.705037',
    subject_name: 'DEMO Informatika',
    date_modified: '',
    subject_type: 'Informatika',
    subject_grade: '9. ročník ZŠ'
  })

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="homepage">
      <header className="homepage-header">
      </header>
      <main className="homepage-body">
        <MaterialPost author={user} subject={testSubject} topicNames={['Neo4j grafová databáze', "Hyper Text Markup Language", "Cascading Style Sheets", "Úvod do problematiky chrousta co spadl z nebe a už nikdy nevzlétl, protože se bál, že ho někdo počůrá", "React JS"]} />
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
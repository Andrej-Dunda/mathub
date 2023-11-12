import './Blogs.scss'
import BlogPost from '../components/blog/BlogPost';

const Blogs = () => {
  return (
    <div className="blogs-window">
      <h1>Blogs</h1>
      <div className="blog-posts">
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
        <BlogPost/>
      </div>
    </div>
  )
}

export default Blogs;
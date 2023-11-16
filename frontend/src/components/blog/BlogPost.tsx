import './BlogPost.scss'
import DefaultProfilePicture from '../../images/DefaultProfilePicture'
import LikeButton from '../like-button/LikeButton'
import React, { useState } from 'react'

const blogDummyData = {
  id: 0,
  user_id: 0,
  time: '2023-11-12 11:30:45',
  title: 'Lorem Ipsum',
  content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit. Maecenas aliquet accumsan leo. Nam quis nulla. Nulla turpis magna, cursus sit amet, suscipit a, interdum id, felis. Mauris dolor felis, sagittis at, luctus sed, aliquam non, tellus. Nullam eget nisl. Morbi scelerisque luctus velit. Nulla non lectus sed nisl molestie malesuada. Fusce dui leo, imperdiet in, aliquam sit amet, feugiat eu, orci. Et harum quidem rerum facilis est et expedita distinctio. Sed ac dolor sit amet purus malesuada congue. Cras elementum. Ut tempus purus at lorem. Nulla est. Aliquam erat volutpat.',
  image: 'image.png',
  likes: 12,
  habit_id: 0,
  group_id: 0
}

const userDummyInfo = {
  id: 0,
  name: 'Borek Stavitel',
  profilePicture: 'profile-picture-default.png'
}

const BlogPost = () => {
  const [profilePictureName, setProfilePictureName] = useState<string>('profile-picture-default.png')
  const czechMonthNames = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];
  const postCreationDate = new Date(blogDummyData.time)
  // Custom format for Czech date string
  const dayOfMonth = postCreationDate.getDate();
  const monthName = czechMonthNames[postCreationDate.getMonth()];
  const hour = postCreationDate.getHours();
  const minute = postCreationDate.getMinutes();
  const customDateFormat = `${dayOfMonth}. ${monthName} v ${hour}:${minute}`;

  return (
    <div className="blog-post">
      <div className="blog-post-header">
        <div className="blog-info">
          <div className="user-profile-picture">
            <img src={`/images/${profilePictureName}`} alt="" />
          </div>
          <div className="user-name-and-post-time">
            <h3 className='user-name h3'>{userDummyInfo.name}</h3>
            <span className='blog-post-time'>{customDateFormat}</span>
          </div>
          <div className="blog-post-likes">
            <LikeButton/>
            <span>{blogDummyData.likes}</span>
          </div>
        </div>
        <hr />
        <h2 className='h2'>{blogDummyData.title}</h2>
      </div>
      <div className="blog-post-body">
        <p className='blog-post-content'>{blogDummyData.content}</p>
      </div>
    </div>
  )
}
export default BlogPost;
import React from 'react'
import './UserProfile.scss'
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import httpClient from '../../utils/httpClient';
import { iUser } from '../../interfaces/user-interface';
import { useNav } from '../../contexts/NavigationProvider';
import ProfilePicture from '../../components/profile-picture/ProfilePicture';
import { useUserData } from '../../contexts/UserDataProvider';
import { iSubject } from '../../interfaces/materials-interface';
import { iPost } from '../../interfaces/blog-interfaces';
import BlogPost from '../../components/blog-post/BlogPost';

const UserProfile = () => {
  const { user } = useUserData();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState<string>('');
  const [viewedUser, setViewedUser] = useState<iUser | null>(null);
  const [subjects, setSubjects] = useState<iSubject[]>([]);
  const [posts, setPosts] = useState<iPost[]>([]);
  const { toMyProfile } = useNav()

  useEffect(() => {
    let paramUserId = searchParams.get("user_id");
    setUserId(paramUserId ? paramUserId : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (userId && user._id && userId === user._id) toMyProfile();
    else userId && httpClient.get(`/api/user-profile/${userId}`)
      .then(res => {
        setViewedUser({
          _id: res.data.user._id,
          email: res.data.user.user_email,
          first_name: res.data.user.first_name,
          last_name: res.data.user.last_name,
          profile_picture: res.data.user.profile_picture,
          registration_date: res.data.user.registration_date
        })
        setSubjects(res.data.subjects)
        setPosts(res.data.posts)
      })
      .catch(() => setViewedUser(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user._id])

  const normalizeDate = (date: string) => {
    const registrationDateRaw = new Date(date)
    const czechMonthNames = [
      'ledna', 'února', 'března', 'dubna', 'května', 'června',
      'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
    ];
    // Custom format for Czech date string
    const dayOfMonth = registrationDateRaw.getDate();
    const monthName = czechMonthNames[registrationDateRaw.getMonth()];
    const year = registrationDateRaw.getFullYear();
    return `${dayOfMonth}. ${monthName} ${year}`;
  }

  return (
    <>
      {viewedUser ? (
        <div className="user-profile">
          <div className="user-wrapper">
            <ProfilePicture className='large radius-100 box-shadow-dark' userId={viewedUser._id} redirect={false} />
            <div className="user-info">
              <h1 className='h1'>{viewedUser.first_name + ' ' + viewedUser.last_name}</h1><hr />
              <div className="user-info-fields-wrapper">
                <div className="user-info-field">
                  <span className='email-label label'>E-mail</span>
                  <span className='email info'>{viewedUser.email}</span>
                </div>
                <div className="user-info-field">
                  <span className='registration-date-label label'>Datum registrace</span>
                  <span className='registration-date info'>{normalizeDate(viewedUser.registration_date)}</span>
                </div>
              </div><hr />
            </div>
          </div>
          <hr />
          <h2 className="h2">Materiály uživatele</h2>
          <div className="user-materials">
            {
              subjects.length > 0 ? subjects.map((subject, index) => {
                return (
                  <div className="subject-button" key={index}>
                    <div className="subject-button-header">
                      <span className="date-created">{normalizeDate(subject.date_created)}</span>
                    </div>
                    <div className="subject-button-body" title={subject.subject_name}>
                      <main>
                        <h5>
                          {subject.subject_name}
                        </h5>
                      </main>
                      <footer className='subject-button-footer'>
                        <span className='subject-type'>
                          {subject.subject_type}
                        </span>
                        <span className='subject-grade'>
                          {subject.subject_grade}
                        </span>
                      </footer>
                    </div>
                  </div>
                )
              }) : (
                <span className='no-materials'>Uživatel zatím nemá žádné materiály :(</span>
              )
            }
          </div>
          <hr />
          <h2 className="h2">Příspěvky uživatele</h2>
          <div className="user-posts">
            {
              posts.length > 0 ? posts.map((post, index) => {
                return (
                  <BlogPost
                    key={index}
                    postData={post}
                  />
                )
              }) : (
                <span className='no-posts'>Uživatel zatím nemá žádné příspěvky :(</span>
              )
            }
          </div>
        </div>
      ) : (
        <div className="user-profile">
          <div className="no-user-wrapper">
            <h1>Uživatel neexistuje :(</h1>
            <div className="no-user-content">
              <span className='no-user-questionmark'>?</span>
            </div>
          </div>
        </div>
      )
      }
    </>
  )
}

export default UserProfile

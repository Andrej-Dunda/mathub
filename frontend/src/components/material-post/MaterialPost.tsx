import React, { useEffect, useRef, useState } from 'react'
import './MaterialPost.scss'
import ProfilePicture from '../profile-picture/ProfilePicture'
import { iSubject } from '../../interfaces/materials-interface'
import { iUser } from '../../interfaces/user-interface'
import { useUserData } from '../../contexts/UserDataProvider'
import { useNav } from '../../contexts/NavigationProvider'
import { normalizeDateHours } from '../../utils/normalizeDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faEye, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import ToggleTopicsButton from '../buttons/toggle-topics-button/ToggleTopicsButton'

type MaterialPostProps = {
  subject: iSubject;
  author: iUser;
  topicNames: string[];
}

const MaterialPost = ({ subject, author, topicNames }: MaterialPostProps) => {
  const { user } = useUserData();
  const { toMyProfile, toUserProfile, toPreviewMaterial } = useNav();

  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  const [topicsVisible, setTopicsVisible] = useState<boolean>(false);
  const topicsListRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const postContentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(topicsListRef.current?.getBoundingClientRect().height || 0);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [topicsVisible]);

  const redirectToUserProfile = () => {
    if (author._id === user._id) toMyProfile()
    else toUserProfile(author._id)
  }

  // Function to update height off the comment section
  const updateHeight = () => {
    if (postContentRef.current) {
      // Using getBoundingClientRect to get full outer dimensions
      const rect = postContentRef.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  };

  return (
    <div className='material-post'>
      <main className={`material-post-main ${topicsVisible && 'border-right-grey'}`} ref={postContentRef}>
        <div className="material-post-header">
          <div className="material-info">
            <ProfilePicture className='post-size radius-100 border box-shadow-dark' userId={author._id} />
            <div className="user-name-and-post-time">
              <h5
                className='user-name'
                onClick={redirectToUserProfile}
              >{author.first_name} {author.last_name}</h5>
              <span className='material-post-time'>{normalizeDateHours(subject.date_created)}</span>
            </div>
            <ToggleTopicsButton topicsVisible={topicsVisible} setTopicsVisible={setTopicsVisible} />
          </div>
        </div>
        <div className="material-post-body">
          <div className="material-name-and-actions">
            <div className="material-name">
              <span className='label'>Název materiálu:</span>
              <h5 className='h4'>{subject.subject_name}</h5>
            </div>
            <div className="material-post-actions">
              <button className="dark box-shadow" onClick={() => toPreviewMaterial(subject._id)}>
                <span>Otevřít</span>
                <FontAwesomeIcon icon={faFolderOpen} color={grayscale100} />
              </button>
              <button className="light box-shadow">
                <span>Sledovat</span>
                <FontAwesomeIcon icon={faEye} color={grayscale900} />
              </button>
            </div>
          </div>
          <div className="material-classification">
            <div className='material-post-type'>
              <span className='label'>Typ materiálu:</span>
              <span className='info'>{subject.subject_type}</span>
            </div>
            <div className='material-post-grade'>
              <span className='label'>Ročník:</span>
              <span className='info'>{subject.subject_grade}</span>
            </div>
          </div>
        </div>
      </main>
      <aside className={`material-post-aside material-post-topics ${!topicsVisible ? 'topics-hidden' : ''}`} ref={topicsListRef} style={{ height: `${height}px` }} >
        <div className="topics-header">
          <h4 className="h4">Seznam témat</h4>
          <FontAwesomeIcon icon={faBookOpen} className='book-icon' color={grayscale900} />
        </div>
        <div className="topics" ref={topicsRef} >
          {
            !topicNames ? (
              <span>Žádné komentáře</span>
            ) : (
              topicNames.map((topic, index) => {
                return <div key={index} className='topic'><span>{topic}</span></div>
              })
            )
          }
        </div>
      </aside>
    </div>
  )
}

export default MaterialPost

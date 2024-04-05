import React, { useEffect, useRef, useState } from 'react'
import './MaterialPost.scss'
import ProfilePicture from '../profile-picture/ProfilePicture'
import { iMaterial, iTopic } from '../../interfaces/materials-interface'
import { iUser } from '../../interfaces/user-interface'
import { useUserData } from '../../contexts/UserDataProvider'
import { useNav } from '../../contexts/NavigationProvider'
import { normalizeDateHours } from '../../utils/normalizeDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import ToggleTopicsButton from '../buttons/toggle-topics-button/ToggleTopicsButton'
import MaterialFollowButton from '../buttons/material-follow-button/MaterialFollowButton'
import httpClient from '../../utils/httpClient'

type MaterialPostProps = {
  material: iMaterial;
  onStopFollowing?: () => void;
}

const MaterialPost = ({ material, onStopFollowing }: MaterialPostProps) => {
  const { user } = useUserData();
  const { toMyProfile, toUserProfile, toPreviewMaterial } = useNav();

  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  const [topicsVisible, setTopicsVisible] = useState<boolean>(false);
  const topicsListRef = useRef<HTMLDivElement>(null);
  const topicsRef = useRef<HTMLDivElement>(null);
  const postContentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(topicsListRef.current?.getBoundingClientRect().height || 0);
  const [author, setAuthor] = useState<iUser>();
  const [topics, setTopics] = useState<iTopic[]>([]);

  useEffect(() => {
    httpClient.get(`/api/materials/${material._id}/topics`)
      .then(res => setTopics(res.data))
      .catch(err => console.error(err))
  }, [material])

  useEffect(() => {
    if (material.author_id) {
      httpClient.get(`/api/users/${material.author_id}`)
        .then(res => setAuthor(res.data))
        .catch(err => console.error(err))
    }
  }, [material.author_id])

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [topicsVisible]);

  const redirectToUserProfile = () => {
    if (material.author_id === user._id) toMyProfile()
    else toUserProfile(material.author_id)
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
            <ProfilePicture className='post-size radius-100 border box-shadow-dark' userId={material.author_id} />
            <div className="user-name-and-post-time">
              <h5
                className='user-name'
                onClick={redirectToUserProfile}
              >{author?.first_name} {author?.last_name}</h5>
              <span className='material-post-time'>{normalizeDateHours(material.date_created)}</span>
            </div>
            <ToggleTopicsButton topicsVisible={topicsVisible} setTopicsVisible={setTopicsVisible} />
          </div>
        </div>
        <div className="material-post-body">
          <div className="material-name-and-actions">
            <div className="material-name">
              <span className='label'>Název materiálu:</span>
              <h5 className='h4'>{material.material_name}</h5>
            </div>
            <div className="material-post-actions">
              <button className="dark box-shadow" onClick={() => toPreviewMaterial(material._id)}>
                <span>Otevřít</span>
                <FontAwesomeIcon icon={faFolderOpen} color={grayscale100} />
              </button>
              <MaterialFollowButton material={material} className='box-shadow' onStopFollowing={onStopFollowing} />
            </div>
          </div>
          <div className="material-classification">
            <div className='material-post-type'>
              <span className='label'>Předmět:</span>
              <span className='info'>{material.material_subject}</span>
            </div>
            <div className='material-post-grade'>
              <span className='label'>Ročník:</span>
              <span className='info'>{material.material_grade}</span>
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
            !topics ? (
              <span>Žádné komentáře</span>
            ) : (
              topics.map((topic, index) => {
                return <div key={index} className='topic'><span>{topic.topic_name}</span></div>
              })
            )
          }
        </div>
      </aside>
    </div>
  )
}

export default MaterialPost

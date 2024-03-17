import './PreviewMaterial.scss'
import React, { useState, useEffect } from 'react'
import DOMPurify from 'dompurify'

import "./react-draft-wysiwyg.css";
import { useSearchParams } from 'react-router-dom'
import httpClient from '../../utils/httpClient'
import { iMaterial, iTopic } from '../../interfaces/materials-interface'
import { iUser } from '../../interfaces/user-interface'
import AsideMenu from '../../components/layout-components/aside-menu/AsideMenu';
import MainContent from '../../components/layout-components/main-content/MainContent';
import { normalizeDateHours } from '../../utils/normalizeDate';
import ProfilePicture from '../../components/profile-picture/ProfilePicture';
import { useNav } from '../../contexts/NavigationProvider';
import PageNotFound from '../page-not-found/PageNotFound';

const PreviewMaterial = () => {
  const { toUserProfile } = useNav();

  const [searchParams] = useSearchParams();
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [materialId, setMaterialId] = useState<string>(searchParams.get("material_id") ?? '');

  const [validMaterialId, setValidMaterialId] = useState<boolean>(false);
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [topics, setTopics] = useState<iTopic[]>([]);
  const [material, setMaterial] = useState<iMaterial | null>(null);
  const [author, setAuthor] = useState<iUser | null>(null);

  const [selectedTopic, setSelectedTopic] = useState<iTopic | null>(null);
  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)

  useEffect(() => {
    let paramMaterialId = searchParams.get("material_id");
    setMaterialId(paramMaterialId ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    // Fetch data from the API
    httpClient.get(`/api/preview-material/${materialId}`)
      .then(res => {
        console.log(res.data)
        setValidMaterialId(res.data.validMaterialId)
        if (res.data.validMaterialId) {
          setIsFriend(res.data.isFriend)
          setAuthor(res.data.author)
          if (res.data.isFriend) {
            setTopics(res.data.topics.sort((a: iTopic, b: iTopic) => a.topic_name.localeCompare(b.topic_name)))
            setMaterial(res.data.material)
          }
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }, [materialId])

  useEffect(() => {
    if (topics.length > 0) {
      setSelectedTopic(topics[0])
    }
  }, [topics])

  useEffect(() => {
    if (selectedTopic) {
      setConvertedContent(selectedTopic.topic_content)
    }
  }, [selectedTopic])

  const getTopic = async (topic_id: string) => {
    httpClient.get(`/api/get-topic/${topic_id}`)
      .then(res => {
        setSelectedTopic(res.data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const createMarkup = (html: string) => {
    return {
      __html: DOMPurify.sanitize(html),
    }
  }

  const handleTopicChange = (topic_id: string) => {
    topic_id !== selectedTopic?._id && getTopic(topic_id)
  }

  return (
    <>
      {
        validMaterialId ?
          (
            isFriend ? (
              <div className={`preview-material ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
                <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
                  <div className="aside-header">
                    <div className="material-title">
                      <span title={material?.material_name}>{material?.material_name}</span>
                    </div>
                  </div>
                  <div className="aside-body">
                    {
                      topics.map((topic: iTopic, index) => {
                        return (
                          <div
                            key={index}
                            className={`aside-button topic-button ${topic._id === selectedTopic?._id ? 'active' : ''}`}
                            title={topic.topic_name.trim() && topic.topic_name.trim()}
                            onClick={() => handleTopicChange(topic._id)}
                          >
                            <span>{topic.topic_name}</span>
                          </div>
                        )
                      })
                    }
                  </div>
                </AsideMenu>
                <MainContent>
                  <div className="main-content-header">
                    <span className='topic-title'>{selectedTopic?.topic_name}</span>
                    {
                      author && <div className="author-meta">
                        <ProfilePicture className='xsmall radius-100 box-shadow-dark' userId={author._id} />
                        <div className="author-name-wrapper">
                          <span className='author-label'>Autor materiálu:</span>
                          <span className='author-name' onClick={() => toUserProfile(author._id)}>{`${author?.first_name}  ${author?.last_name}`}</span>
                        </div>
                      </div>
                    }
                  </div>
                  <div className="main-content-body">
                    <div className="material-meta-data">
                      <div className="meta-data-wrapper">
                        {selectedTopic && <span className="date-modified">Upraveno {normalizeDateHours(selectedTopic.date_modified)}</span>}
                        {material && <span className='material-subject-and-grade'>{material.material_subject} pro {material.material_grade}</span>}
                      </div>
                    </div>
                    <div className="preview-wrapper">
                      <div
                        className="preview-content"
                        dangerouslySetInnerHTML={createMarkup(convertedContent)}
                      ></div>
                    </div>
                  </div>
                </MainContent>
              </div>
            ) : (
              <div className="preview-material-not-friend">
                <div className="not-friend">
                  <span className='message'>Pro zobrazení těchto materiálů musíte být přáteli s autorem!</span>
                  {
                    author && <div className="user-wrapper">
                      <ProfilePicture className='large radius-100 box-shadow-dark' userId={author._id} />
                      <h1 className='h1 user-name' onClick={() => toUserProfile(author._id)}>{author.first_name + ' ' + author.last_name}</h1>
                      <button className="redirect-to-profile-button">
                        <span onClick={() => toUserProfile(author._id)}>Přejít na profil</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            )
          ) : (
            <PageNotFound />
          )
      }
    </>
  )
}

export default PreviewMaterial;
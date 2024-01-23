import { useEffect, useRef, useState } from 'react'
import './ViewTopics.scss'
import AsideMenu from '../../components/layout-components/aside-menu/AsideMenu';
import MainContent from '../../components/layout-components/main-content/MainContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave } from '@fortawesome/free-solid-svg-icons';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import SubjectDropdown from '../../components/subject-dropdown/SubjectDropdown';
import { iTopic } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import ModalFooter from '../../components/modal/modal-footer/ModalFooter';
import { useMaterials } from '../../contexts/MaterialsProvider';
import EllipsisMenuButton from '../../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import DeleteModalContent from '../../components/modal/modal-contents/DeleteModalContent';
import SaveTopicModalContent from '../../components/modal/modal-contents/SaveTopicModalContent';

const ViewTopics: React.FC = () => {
  const {
    getSubjects,
    selectedSubject,
    topics,
    selectedTopic,
    getTopic,
    postTopic,
    putTopic,
    deleteTopic
  } = useMaterials();
  const [oldTopicsLength, setOldTopicsLength] = useState<number>(topics.length)
  const topicsRefs = useRef<Array<HTMLElement | null>>([]);
  const [editorTopicContent, setEditorTopicContent] = useState<string>('')

  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();
  const { showModal } = useModal();

  useEffect(() => {
    getSubjects()
    setTimeout(() => setIsAsideMenuOpen(false), 200);

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's' && selectedTopic?.topic_content !== editorTopicContent) {
        e.preventDefault()
        saveTopic()
      }
    })

    return () => {
      window.removeEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault()
          saveTopic()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    topicsRefs.current = topicsRefs.current.slice(0, topics.length);
  }, [topics]);

  useEffect(() => {
    if (oldTopicsLength === topics.length - 1) {
      getTopic(topics[topics.length - 1]._id)
      scrollToElement(topics.length - 1);
    }
    setOldTopicsLength(topics.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, oldTopicsLength])

  useEffect(() => {
    if (selectedTopic) {
      setEditorTopicContent(selectedTopic.topic_content)
    }
  }, [selectedTopic])

  const onEditorTopicSwitch = (onFinish?: any) => {
    if (selectedTopic?.topic_content !== editorTopicContent) {
      return showModal(<SaveTopicModalContent saveTopic={saveTopic} onFinish={onFinish} />);
    }
    onFinish && onFinish();
  }

  const saveTopic = (keepTopicSelected?: boolean) => {
    if (selectedTopic) {
      putTopic(selectedTopic._id, selectedTopic.topic_name, editorTopicContent, keepTopicSelected)
      setEditorTopicContent(selectedTopic.topic_content)
    }
  }

  const scrollToElement = (index: number) => {
    const element = topicsRefs.current[index];
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openNewTopicModal = () => {
    showModal(<NewTopicModalContent />)
  }

  const handleTopicChange = (topic_id: string) => {
    onEditorTopicSwitch(() => getTopic(topic_id))
  }

  const NewTopicModalContent: React.FC = () => {
    const [newTopicName, setNewTopicName] = useState<string>('')
    const [newTopicModalError, setNewTopicModalError] = useState<string>('')
    const newTopicNameInputRef = useRef<HTMLInputElement>(null)
    const { closeModal } = useModal();

    useEffect(() => {
      newTopicNameInputRef.current?.focus()
    }, [])

    const submitNewTopic = () => {
      if (newTopicName.trim() && selectedSubject) {
        postTopic(selectedSubject._id, newTopicName.trim())
        closeModal()
        return
      }
      setNewTopicModalError('Vyplňte pole Název nového materiálu!')
      newTopicNameInputRef.current?.focus()
    }

    return (
      <div className="new-topic-form">
        <h1 className='h1'>Nový materiál</h1>
        <div className='new-topic-wrapper'>
          <label htmlFor="new-topic-name-input">Název nového materiálu:</label>
          <input
            type='text'
            id='new-topic-name-input'
            name='new-topic-name-input'
            value={newTopicName}
            onChange={(e: any) => setNewTopicName(e.target.value)}
            ref={newTopicNameInputRef}
          />
        </div>
        <ErrorMessage content={newTopicModalError} />
        <ModalFooter onSubmit={submitNewTopic} submitButtonLabel='Přidat materiál' cancelButtonLabel='Zrušit' />
      </div>
    )
  }

  return (
    <div className={`view-topics ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
      <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
        <div className="aside-header">
          <SubjectDropdown isAsideMenuOpen={isAsideMenuOpen} onEditorTopicSwitch={onEditorTopicSwitch} />
          <div className="aside-button new-topic-button" onClick={openNewTopicModal}>
            <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
            <span className='new-topic-label'>Nový materiál</span>
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
                  ref={el => (topicsRefs.current[index] = el)}
                >
                  <span>{topic.topic_name}</span>
                  <EllipsisMenuButton
                    className='topic-button-ellipsis'
                    onClick={(e) => e.stopPropagation()}
                    light={topic._id === selectedTopic?._id ? false : true}
                    menuOptions={[
                      {
                        name: 'Smazat',
                        icon: faTrash,
                        onClick: () => showModal(
                          <DeleteModalContent
                            onSubmit={() => deleteTopic(topic._id)}
                            submitButtonLabel='Smazat'
                            cancelButtonLabel='Zrušit'
                            title={`Smazat materiál "${topic.topic_name}"?`}
                            content='Opravdu chcete smazat tento materiál? Tato akce je nevratná!'
                          />
                        )
                      }
                    ]} />
                </div>
              )
            })
          }
        </div>
      </AsideMenu>
      <MainContent>
        <div className="main-content-header">
          <span className='topic-title'>{selectedTopic?.topic_name}</span>
          <button
            className={`save-button ${editorTopicContent === selectedTopic?.topic_content ? '' : 'not-saved'}`}
            onClick={() => editorTopicContent !== selectedTopic?.topic_content && saveTopic(true)}
          >
            <FontAwesomeIcon icon={faSave} color={editorTopicContent === selectedTopic?.topic_content ? grayscale900 : grayscale100} className='save-icon' />
            <span className='label'>Uložit</span>
          </button>
        </div>
        <div className="main-content-body">
          <textarea
            name="topic-content"
            id="topic-content"
            className="topic-content"
            value={editorTopicContent}
            onChange={(e: any) => setEditorTopicContent(e.target.value)}
          />
        </div>
      </MainContent>
    </div>
  )
}
export default ViewTopics;
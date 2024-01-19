import { useEffect, useRef, useState } from 'react'
import './ViewMaterials.scss'
import AsideMenu from '../../components/layout-components/aside-menu/AsideMenu';
import MainContent from '../../components/layout-components/main-content/MainContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import SubjectDropdown from '../../components/subject-dropdown/SubjectDropdown';
import { iTopic } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import ModalFooter from '../../components/modal/modal-footer/ModalFooter';
import { useMaterials } from '../../contexts/MaterialsProvider';
import EllipsisMenuButton from '../../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import DeleteModalContent from '../../components/modal/modal-contents/DeleteModalContent';

const ViewMaterials: React.FC = () => {
  const {
    getSubjects,
    selectedSubject,
    topics,
    selectedTopic,
    getTopic,
    postTopic,
    deleteTopic
  } = useMaterials();
  const [oldTopicsLength, setOldTopicsLength] = useState<number>(topics.length)
  const topicsRefs = useRef<Array<HTMLElement | null>>([]);

  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();
  const { showModal } = useModal();

  useEffect(() => {
    getSubjects()
    setTimeout(() => setIsAsideMenuOpen(false), 200);
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

  const scrollToElement = (index: number) => {
    const element = topicsRefs.current[index];
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openNewMaterialModal = () => {
    showModal(<NewTopicModalContent />)
  }

  const NewTopicModalContent: React.FC = () => {
    const [newTopicName, setNewTopicName] = useState<string>('')
    const [newTopicModalError, setNewTopicModalError] = useState<string>('')
    const newTopicNameInputRef = useRef<HTMLInputElement>(null)
    const { closeModal }  = useModal();

    useEffect(() => {
      newTopicNameInputRef.current?.focus()
    }, [])

    const submitNewTopic = () => {
      if (newTopicName && selectedSubject) {
        postTopic(selectedSubject._id, newTopicName)
        closeModal()
        return 
      }
      setNewTopicModalError('Vyplňte pole Název nového materiálu!')
      newTopicNameInputRef.current?.focus()
    }

    return (
      <div className="new-material-form">
        <h1 className='h1'>Nový materiál</h1>
        <div className='new-material-wrapper'>
          <label htmlFor="new-material-name-input">Název nového materiálu:</label>
          <input
            type='text'
            id='new-material-name-input'
            name='new-material-name-input'
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
    <div className={`view-materials ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
      <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
        <div className="aside-header">
          <SubjectDropdown isAsideMenuOpen={isAsideMenuOpen} />
          <div className="aside-button new-material-button" onClick={openNewMaterialModal}>
            <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
            <span className='new-material-label'>Nový materiál</span>
          </div>
        </div>
        <div className="aside-body">
          {
            topics.map((topic: iTopic, index) => {
              return (
                <div
                  key={index}
                  className={`aside-button material-button ${topic._id === selectedTopic?._id ? 'active' : ''}`}
                  title={topic.topic_name}
                  onClick={() => getTopic(topic._id)}
                  ref={el => (topicsRefs.current[index] = el)}
                >
                  <span>{topic.topic_name}</span>
                  <EllipsisMenuButton
                    className='material-button-ellipsis'
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
          <span className='material-title'>{selectedTopic?.topic_name}</span>
        </div>
        <div className="main-content-body">
          {selectedTopic?.topic_content}
        </div>
      </MainContent>
    </div>
  )
}
export default ViewMaterials;
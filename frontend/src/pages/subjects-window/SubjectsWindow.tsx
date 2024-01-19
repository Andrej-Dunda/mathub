import './SubjectsWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useRef, useEffect } from 'react';
import { iSubject } from '../../interfaces/materials-interface';
import EllipsisMenuButton from '../../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import { useNav } from '../../contexts/NavigationProvider';
import { useModal } from '../../contexts/ModalProvider';
import NewSubjectModalContent from '../../components/modal/modal-contents/NewSubjectModalContent';
import { useMaterials } from '../../contexts/MaterialsProvider';

const SubjectsWindow = () => {
  const { subjects, getSubjects, setSelectedSubject } = useMaterials();
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  const grayscale300 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-300').trim();
  const { toViewMaterials, setActiveLink } = useNav();
  const { showModal, modalOpen } = useModal();

  useEffect(() => {
    setActiveLink('/subjects')
    getSubjects()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveLink])

  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  }, [modalOpen])

  const openNewSubjectModal = () => {
    showModal(<NewSubjectModalContent />)
  }

  const openSubject = (subject: iSubject) => {
    setSelectedSubject(subject)
    toViewMaterials()
  }

  return (
    <div className="subjects-window">
      <h1 className='h1'>Moje předměty</h1>
      <div className="subjects">
        {
          subjects.map((subject: iSubject, index: number) => {
            return (
              <div key={index} className="subject-button">
                <header>
                  <EllipsisMenuButton menuOptions={['option 1', 'option 2', 'option 3', 'option 4']}/>
                </header>
                <main onClick={() => openSubject(subject)} title={subject.subject_name}>
                  <span>
                    {subject.subject_name}
                  </span>
                </main>
              </div>
            )
          })
        }
        <button type='button' className="add-subject-button" onClick={openNewSubjectModal}>
          <FontAwesomeIcon icon={faPlus} className='edit-icon' size="2x" color={grayscale300} />
        </button>
      </div>
    </div>
  )
}
export default SubjectsWindow;
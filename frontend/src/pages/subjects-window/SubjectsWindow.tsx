import './SubjectsWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { iSubject } from '../../interfaces/materials-interface';
import EllipsisMenuButton from '../../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import { useNav } from '../../contexts/NavigationProvider';
import { useModal } from '../../contexts/ModalProvider';
import NewSubjectModalContent from '../../components/modal/modal-contents/NewSubjectModalContent';

const SubjectsWindow = () => {
  const [subjects, setSubjects] = useState<iSubject[]>([
    {subjectName: 'Češtinaalskdjhgljkhalskdjfhlakjhdsfadflgkjhaldkjgh', subjectId: uuidv4(), materials: [{ materialId: uuidv4(), materialName: '1. Literatura 2. poloviny 20. století' }]},
    {subjectName: 'Ekonomie', subjectId: uuidv4(), materials: []},
    {subjectName: 'Informatika', subjectId: uuidv4(), materials: [{ materialId: uuidv4(), materialName: '1. Hardware' }]},
    {subjectName: 'Angličtina', subjectId: uuidv4(), materials: [{ materialId: uuidv4(), materialName: '1. Schools and Education' }]},
    {subjectName: 'Matematika', subjectId: uuidv4(), materials: [{ materialId: uuidv4(), materialName: '1. Kombinatorika a pravděpodobnost' }]},
  ])
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  const grayscale300 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-300').trim();
  const { toViewMaterials, setActiveLink } = useNav();
  const { showModal, modalOpen } = useModal();

  useEffect(() => {
    setActiveLink('subjects')
  })

  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  }, [modalOpen])

  const openNewSubjectModal = () => {
    showModal(<NewSubjectModalContent subjects={subjects} setSubjects={setSubjects} />)
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
                <main onClick={toViewMaterials} title={subject.subjectName}>
                  <span>
                    {subject.subjectName}
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
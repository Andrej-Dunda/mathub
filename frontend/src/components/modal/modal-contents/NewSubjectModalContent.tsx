import './NewSubjectModalContent.scss';
import { useEffect, useRef, useState } from "react"
import ErrorMessage from '../../error-message/ErrorMessage';
import ModalFooter from '../../modal/modal-footer/ModalFooter';
import { useModal } from "../../../contexts/ModalProvider";
import { useMaterials } from '../../../contexts/MaterialsProvider';
import Dropdown from '../../buttons/dropdown/Dropdown';

const NewSubjectModalContent: React.FC = () => {
  const { postSubject } = useMaterials();
  const [newSubjectName, setNewSubjectName] = useState<string>('')
  const [newSubjectModalError, setNewSubjectModalError] = useState<string>('')
  const { closeModal } = useModal();
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  const subjectTypes = ['Jiné', 'Angličtina', 'Biologie', 'Český jazyk', 'Chemie', 'Dějepis', 'Ekonomie', 'Etická výchova', 'Francouzský jazyk', 'Fyzika', 'Hudební výchova', 'Informatika', 'Matematika', 'Náboženství', 'Německý jazyk', 'Pracovní výchova', 'Psychologie', 'Ruský jazyk', 'Španělský jazyk', 'Tělesná výchova', 'Výtvarná výchova', 'Základy společenských věd', 'Zeměpis']
  const [selectedSubjectType, setSelectedSubjectType] = useState<string>("-- Neurčeno --")
  const subjectGrades = ["Jiné", "1. ročník", "2. ročník", "3. ročník", "4. ročník", "5. ročník", "6. ročník", "7. ročník", "8. ročník", "9. ročník", "10. ročník", "11. ročník", "12. ročník", "13. ročník"]
  const [selectedSubjectGrade, setSelectedSubjectGrade] = useState<string>("-- Neurčeno --")
  
  useEffect(() => {
    newSubjectNameInputRef.current?.focus()

    return () => {
      setNewSubjectName('')
      setNewSubjectModalError('')
      setSelectedSubjectType("-- Neurčeno --")
      setSelectedSubjectGrade("-- Neurčeno --")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const submitNewSubject = () => {
    if (!newSubjectName.trim()) {
      setNewSubjectModalError('Vyplňte pole Název nového předmětu!')
      newSubjectNameInputRef.current?.focus()
      return
    }
    if (!selectedSubjectType || selectedSubjectType === "-- Neurčeno --") return setNewSubjectModalError('Vyberte typ předmětu!')
    if (!selectedSubjectGrade || selectedSubjectGrade === "-- Neurčeno --") return setNewSubjectModalError('Vyberte ročník předmětu!')
    else {
      closeModal()
      return postSubject(newSubjectName.trim(), selectedSubjectType, selectedSubjectGrade)
    }
  }

  return (
    <>
      <h1 className='h1'>Nový předmět</h1>
      <div className='new-subject-wrapper'>
        <div className="name-input-wrapper">
          <label htmlFor="new-subject-name-input">Název nového předmětu:</label>
          <input
            type='text'
            id='new-subject-name-input'
            name='new-subject-name-input'
            value={newSubjectName}
            onChange={(e: any) => setNewSubjectName(e.target.value)}
            ref={newSubjectNameInputRef}
          />
        </div>
        <div className="new-subject-classification">
          <Dropdown
            className='new-subject-type-select'
            dropdownItems={subjectTypes}
            selectedItem={selectedSubjectType}
            setSelectedItem={setSelectedSubjectType}
            label='Typ předmětu:'
          />
          <Dropdown
            className='new-subject-grade-select'
            dropdownItems={subjectGrades}
            selectedItem={selectedSubjectGrade}
            setSelectedItem={setSelectedSubjectGrade}
            label='Ročník:'
          />
        </div>
      </div>
      <ErrorMessage content={newSubjectModalError} />
      <ModalFooter onSubmit={submitNewSubject} submitButtonLabel='Přidat předmět' cancelButtonLabel='Zrušit' />
    </>
  )
}
export default NewSubjectModalContent;
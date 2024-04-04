import './NewMaterialModalContent.scss';
import { useEffect, useRef, useState } from "react"
import ErrorMessage from '../../error-message/ErrorMessage';
import ModalFooter from '../modal-footer/ModalFooter';
import { useModal } from "../../../contexts/ModalProvider";
import { useMaterials } from '../../../contexts/MaterialsProvider';
import Dropdown from '../../buttons/dropdown/Dropdown';

const NewMaterialModalContent: React.FC = () => {
  const { postMaterial } = useMaterials();
  const [newMaterialName, setNewMaterialName] = useState<string>('')
  const [newMaterialModalError, setNewMaterialModalError] = useState<string>('')
  const { closeModal } = useModal();
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const materialSubjects = ['Jiné', 'Angličtina', 'Biologie', 'Český jazyk', 'Chemie', 'Dějepis', 'Ekonomie', 'Etická výchova', 'Francouzský jazyk', 'Fyzika', 'Hudební výchova', 'Informatika', 'Matematika', 'Náboženství', 'Německý jazyk', 'Pracovní výchova', 'Psychologie', 'Ruský jazyk', 'Španělský jazyk', 'Tělesná výchova', 'Výtvarná výchova', 'Základy společenských věd', 'Zeměpis']
  const [selectedMaterialSubject, setSelectedMaterialSubject] = useState<string>("-- Neurčeno --")
  const materialGrades = ["Jiné", "1. ročník", "2. ročník", "3. ročník", "4. ročník", "5. ročník", "6. ročník", "7. ročník", "8. ročník", "9. ročník", "10. ročník", "11. ročník", "12. ročník", "13. ročník"]
  const [selectedMaterialGrade, setSelectedMaterialGrade] = useState<string>("-- Neurčeno --")
  
  useEffect(() => {
    newMaterialNameInputRef.current?.focus()

    return () => {
      setNewMaterialName('')
      setNewMaterialModalError('')
      setSelectedMaterialSubject("-- Neurčeno --")
      setSelectedMaterialGrade("-- Neurčeno --")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const submitNewMaterial = () => {
    if (!newMaterialName.trim()) {
      setNewMaterialModalError('Pole Název nesmí být prázdné!')
      newMaterialNameInputRef.current?.focus()
      return
    }
    if (!selectedMaterialSubject || selectedMaterialSubject === "-- Neurčeno --") return setNewMaterialModalError('Vyberte předmět!')
    if (!selectedMaterialGrade || selectedMaterialGrade === "-- Neurčeno --") return setNewMaterialModalError('Vyberte ročník!')
    else {
      closeModal()
      return postMaterial(newMaterialName.trim(), selectedMaterialSubject, selectedMaterialGrade)
    }
  }

  return (
    <>
      <h1 className='h1'>Nový materiál</h1>
      <div className='new-material-wrapper'>
        <div className="name-input-wrapper">
          <label htmlFor="new-material-name-input">Název:</label>
          <input
            type='text'
            id='new-material-name-input'
            name='new-material-name-input'
            value={newMaterialName}
            onChange={(e: any) => setNewMaterialName(e.target.value)}
            ref={newMaterialNameInputRef}
          />
        </div>
        <div className="new-material-classification">
          <Dropdown
            className='new-material-subject-select'
            dropdownItems={materialSubjects}
            selectedItem={selectedMaterialSubject}
            setSelectedItem={setSelectedMaterialSubject}
            label='Předmět:'
          />
          <Dropdown
            className='new-material-grade-select'
            dropdownItems={materialGrades}
            selectedItem={selectedMaterialGrade}
            setSelectedItem={setSelectedMaterialGrade}
            label='Ročník:'
          />
        </div>
      </div>
      <ErrorMessage content={newMaterialModalError} />
      <ModalFooter onSubmit={submitNewMaterial} submitButtonLabel='Přidat materiál' cancelButtonLabel='Zrušit' />
    </>
  )
}
export default NewMaterialModalContent;
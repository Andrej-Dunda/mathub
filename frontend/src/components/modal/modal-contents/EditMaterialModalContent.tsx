import './EditMaterialModalContent.scss'
import React, { useEffect, useRef, useState } from 'react'
import { iMaterial } from '../../../interfaces/materials-interface'
import ModalFooter from '../modal-footer/ModalFooter'
import { useModal } from '../../../contexts/ModalProvider'
import { useMaterials } from '../../../contexts/MaterialsProvider'
import Dropdown from '../../buttons/dropdown/Dropdown'
import ErrorMessage from '../../error-message/ErrorMessage'

type EditMaterialModalContentProps = {
  material: iMaterial
}

const EditMaterialModalContent = ({material}: EditMaterialModalContentProps) => {
  const { closeModal } = useModal();
  const { putMaterial } = useMaterials();
  const [newMaterialName, setNewMaterialName] = useState<string>(material.material_name)
  const [newMaterialModalError, setNewMaterialModalError] = useState<string>('')
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const materialSubjects = ['Jiné', 'Angličtina', 'Biologie', 'Český jazyk', 'Chemie', 'Dějepis', 'Ekonomie', 'Etická výchova', 'Francouzský jazyk', 'Fyzika', 'Hudební výchova', 'Informatika', 'Matematika', 'Náboženství', 'Německý jazyk', 'Pracovní výchova', 'Psychologie', 'Ruský jazyk', 'Španělský jazyk', 'Tělesná výchova', 'Výtvarná výchova', 'Základy společenských věd', 'Zeměpis']
  const [selectedMaterialSubject, setSelectedMaterialSubject] = useState<string>(material.material_subject)
  const materialGrades = ["Jiné", "1. třída ZŠ", "2. třída ZŠ", "3. třída ZŠ", "4. třída ZŠ", "5. třída ZŠ", "6. třída ZŠ", "7. třída ZŠ", "8. třída ZŠ", "9. třída ZŠ", "1. ročník SŠ", "2. ročník SŠ", "3. ročník SŠ", "4. ročník SŠ"]
  const [selectedMaterialGrade, setSelectedMaterialGrade] = useState<string>(material.material_grade)
  
  useEffect(() => {
    newMaterialNameInputRef.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = () => {
    if (!newMaterialName.trim()) {
      setNewMaterialModalError('Pole Název materiálu nesmí být prázdné!')
      newMaterialNameInputRef.current?.focus()
      return
    }

    putMaterial(material._id, newMaterialName, selectedMaterialSubject, selectedMaterialGrade)
    closeModal()
  }

  const onInputChange = (e: any) => {
    setNewMaterialName(e.target.value)
  }

  return (
    <div className="edit-material-modal-content">
      <h1 className='title'>Upravit materiál</h1>
      <div className='material-wrapper'>
        <div className="name-input-wrapper">
          <label htmlFor="material-name-input">Název materiálu:</label>
          <input
            type='text'
            id='material-name-input'
            name='material-name-input'
            value={newMaterialName}
            onChange={onInputChange}
            ref={newMaterialNameInputRef}
            maxLength={50}
          />
        </div>
        <div className="material-classification">
          <Dropdown
            className='material-subject-select'
            dropdownItems={materialSubjects}
            selectedItem={selectedMaterialSubject}
            setSelectedItem={setSelectedMaterialSubject}
            label='Předmět:'
          />
          <Dropdown
            className='material-grade-select'
            dropdownItems={materialGrades}
            selectedItem={selectedMaterialGrade}
            setSelectedItem={setSelectedMaterialGrade}
            label='Ročník:'
          />
        </div>
      </div>
      <ErrorMessage content={newMaterialModalError} />
      <ModalFooter
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitButtonLabel='Uložit'
        cancelButtonLabel='Zrušit'
      />
    </div>
  )
}

export default EditMaterialModalContent

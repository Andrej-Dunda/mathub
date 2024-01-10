import './NewSubjectModalContent.scss';
import { useEffect, useRef, useState } from "react"
import { useSnackbar } from "../../../contexts/SnackbarProvider";
import ErrorMessage from '../../error-message/ErrorMessage';
import { v4 as uuidv4 } from 'uuid';
import ModalFooter from '../../modal/modal-footer/ModalFooter';
import { useModal } from "../../../contexts/ModalProvider";
import { iSubject } from "../../../interfaces/materials-interface";

interface iNewSubjectModalContent {
  subjects: iSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<iSubject[]>>;
}

const NewSubjectModalContent: React.FC<iNewSubjectModalContent> = ({ subjects, setSubjects }) => {
  const [newSubjectName, setNewSubjectName] = useState<string>('')
  const [newSubjectModalError, setNewSubjectModalError] = useState<string>('')
  const { openSnackbar } = useSnackbar();
  const { closeModal, modalOpen } = useModal();
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  }, [modalOpen])

  const onNewSubjectNameInputChange = (e: any) => {
    setNewSubjectName(e.target.value)
  }

  const validateNewSubjectSubmit = () => {
    if (newSubjectName) {
      setSubjects([...subjects, { subjectName: newSubjectName, subjectId: uuidv4(), materials: [] }])
      setNewSubjectName('')
      setNewSubjectModalError('')
      openSnackbar('Předmět úspěšně vytvořen!')
      closeModal()
      return;
    }
    setNewSubjectModalError('Vyplňte pole Název nového předmětu!')
    newSubjectNameInputRef.current?.focus()
  }


  return (
    <>
      <h1 className='h1'>Nový předmět</h1>
      <div className='new-subject-wrapper'>
        <label htmlFor="new-subject-name-input">Název nového předmětu:</label>
        <input
          type='text'
          id='new-subject-name-input'
          name='new-subject-name-input'
          value={newSubjectName}
          onChange={onNewSubjectNameInputChange}
          ref={newSubjectNameInputRef}
        />
      </div>
      <ErrorMessage content={newSubjectModalError} />
      <ModalFooter onSubmit={validateNewSubjectSubmit} submitButtonLabel='Přidat předmět' cancelButtonLabel='Zrušit' />
    </>
  )
}
export default NewSubjectModalContent;
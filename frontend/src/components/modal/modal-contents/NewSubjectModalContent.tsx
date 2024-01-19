import './NewSubjectModalContent.scss';
import { useEffect, useRef, useState } from "react"
import ErrorMessage from '../../error-message/ErrorMessage';
import ModalFooter from '../../modal/modal-footer/ModalFooter';
import { useModal } from "../../../contexts/ModalProvider";
import { useMaterials } from '../../../contexts/MaterialsProvider';

const NewSubjectModalContent: React.FC = () => {
  const { postSubject } = useMaterials();
  const [newSubjectName, setNewSubjectName] = useState<string>('')
  const [newSubjectModalError, setNewSubjectModalError] = useState<string>('')
  const { closeModal, modalOpen } = useModal();
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen])


  const submitNewSubject = () => {
    if (newSubjectName) {
      setNewSubjectName('')
      setNewSubjectModalError('')
      closeModal()
      return postSubject(newSubjectName)
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
          onChange={(e: any) => setNewSubjectName(e.target.value)}
          ref={newSubjectNameInputRef}
        />
      </div>
      <ErrorMessage content={newSubjectModalError} />
      <ModalFooter onSubmit={submitNewSubject} submitButtonLabel='Přidat předmět' cancelButtonLabel='Zrušit' />
    </>
  )
}
export default NewSubjectModalContent;
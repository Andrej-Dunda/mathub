import './MySubjectsWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/modal/Modal';
import { useState, useRef, useEffect } from 'react';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import Snackbar from '../../components/snack-bar/SnackBar';
import { useNavigate } from 'react-router-dom';

const MySubjectsWindow = () => {
  const [mySubjectsNames, setMySubjectsNames] = useState<string[]>(['Čeština', 'Ekonomie', 'Informatika', 'Angličtina', 'Matematika'])
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState<boolean>(false)
  const [newSubjectName, setNewSubjectName] = useState<string>('')
  const [newSubjectModalError, setNewSubjectModalError] = useState<string>('')
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const navigate = useNavigate();

  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  }, [isNewSubjectModalOpen])

  const validateNewSubjectSubmit = () => {
    if (newSubjectName) {
      setMySubjectsNames([...mySubjectsNames, newSubjectName])
      setIsNewSubjectModalOpen(false)
      setNewSubjectName('')
      setNewSubjectModalError('')
      showSnackbarMessage('Předmět úspěšně vytvořen!')
      return;
    }
    setNewSubjectModalError('Vyplňte pole Název nového předmětu!')
    newSubjectNameInputRef.current?.focus()
  }

  const onNewSubjectNameInputChange = (e: any) => {
    setNewSubjectName(e.target.value)
  }

  const openNewSubjectModal = () => {
    setIsNewSubjectModalOpen(true)
    setNewSubjectModalError('')
  }

  const closeNewSubjectModal = () => {
    setIsNewSubjectModalOpen(false)
    setNewSubjectName('')
  }

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true)
    setSnackbarMessage(message)
  }

  const viewSubjects = () => navigate('/view-materials')

  return (
    <div className="my-subjects-window">
      <h1 className='h1'>Moje předměty</h1>
      <div className="my-subjects">
        {
          mySubjectsNames.map((subjectName: string, index: number) => {
            return (
              <button type='button' key={index} className="subject-button" onClick={viewSubjects}>
                {subjectName}
              </button>
            )
          })
        }
        <button type='button' className="add-subject-button" onClick={openNewSubjectModal}>
          <FontAwesomeIcon icon={faPlus} className='edit-icon' size="2x" color='grey' />
        </button>
      </div>
      <Modal
        isOpen={isNewSubjectModalOpen}
        onClose={closeNewSubjectModal}
        onSubmit={validateNewSubjectSubmit}
        submitContent={'Přidat předmět'}
        cancelContent={'Zrušit'}
      >
        <h1 className='h1'>Nový předmět</h1>
        <div className="new-subject-form">
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
        </div>
      </Modal>
      <Snackbar
        message={snackbarMessage}
        onClose={handleCloseSnackbar}
        showSnackbar={showSnackbar}
        setShowSnackbar={setShowSnackbar}
      />
    </div>
  )
}
export default MySubjectsWindow;
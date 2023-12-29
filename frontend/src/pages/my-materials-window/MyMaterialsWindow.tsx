import './MyMaterialsWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/modal/Modal';
import { useState, useRef, useEffect } from 'react';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import Snackbar from '../../components/snack-bar/SnackBar';

const MyMaterialsWindow = () => {
  const [myMaterialsNames, setMyMaterialsNames] = useState<string[]>(['Čeština', 'Ekonomie', 'Informatika', 'Angličtina', 'Matematika'])
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState<boolean>(false)
  const [newMaterialName, setNewMaterialName] = useState<string>('')
  const [newMaterialModalError, setNewMaterialModalError] = useState<string>('')
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')

  useEffect(() => {
    newMaterialNameInputRef.current?.focus()
  }, [isNewMaterialModalOpen])

  const validateNewMaterialSubmit = () => {
    if (newMaterialName) {
      setMyMaterialsNames([...myMaterialsNames, newMaterialName])
      setIsNewMaterialModalOpen(false)
      setNewMaterialName('')
      setNewMaterialModalError('')
      showSnackbarMessage('Materiál úspěšně vytvořen!')
      return;
    }
    setNewMaterialModalError('Vyplňte pole Název nového materiálu!')
    newMaterialNameInputRef.current?.focus()
  }

  const onNewMaterialNameInputChange = (e: any) => {
    setNewMaterialName(e.target.value)
    console.log(newMaterialName)
  }

  const openNewMaterialModal = () => {
    setIsNewMaterialModalOpen(true)
    setNewMaterialModalError('')
  }

  const closeNewMaterialModal = () => {
    setIsNewMaterialModalOpen(false)
    setNewMaterialName('')
  }

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true)
    setSnackbarMessage(message)
  }

  return (
    <div className="my-materials-window">
      <h1 className='h1'>Moje materiály</h1>
      <div className="my-materials">
        {
          myMaterialsNames.map((materialName, index) => {
            return (
              <button type='button' key={index} className="material-button">
                {materialName}
              </button>
            )
          })
        }
        <button type='button' className="add-material-button" onClick={openNewMaterialModal}>
          <FontAwesomeIcon icon={faPlus} className='edit-icon' size="2x" color='grey' />
        </button>
      </div>
      <Modal
        isOpen={isNewMaterialModalOpen}
        onClose={closeNewMaterialModal}
        onSubmit={validateNewMaterialSubmit}
        submitContent={'Přidat materiál'}
        cancelContent={'Zrušit'}
      >
        <h1 className='h1'>Nový materiál</h1>
        <div className="new-material-form">
          <div className='new-material-wrapper'>
            <label htmlFor="new-material-name-input">Název nového materiálu:</label>
            <input
              type='text'
              id='new-material-name-input'
              name='new-material-name-input'
              value={newMaterialName}
              onChange={onNewMaterialNameInputChange}
              ref={newMaterialNameInputRef}
            />
          </div>
          <ErrorMessage content={newMaterialModalError} />
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
export default MyMaterialsWindow;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SubjectDropdown.scss'
import React, { FC, useEffect, useRef, useState } from 'react';
import { faChevronDown, faChevronUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { iSubject } from '../../interfaces/materials-interface';
import Modal from '../modal/Modal';
import ErrorMessage from '../error-message/ErrorMessage';
import Snackbar from '../snack-bar/SnackBar';
import { v4 as uuidv4 } from 'uuid';

type DropdownProps = {
  isSubjectDropdownOpen: boolean;
  setIsSubjectDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subjects: iSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<iSubject[]>>;
  activeSubjectName: string;
  setActiveSubjectName: React.Dispatch<React.SetStateAction<string>>;
  activeSubjectId: string;
  setActiveSubjectId: React.Dispatch<React.SetStateAction<string>>;
  onChange?: (option: iSubject) => void;
};

const SubjectDropdown: FC<DropdownProps> = ({
  isSubjectDropdownOpen,
  setIsSubjectDropdownOpen,
  subjects,
  setSubjects,
  activeSubjectName,
  setActiveSubjectName,
  activeSubjectId,
  setActiveSubjectId,
  onChange
}) => {
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState<boolean>(false)
  const [newSubjectName, setNewSubjectName] = useState<string>('')
  const [newSubjectModalError, setNewSubjectModalError] = useState<string>('')
  const newSubjectNameInputRef = useRef<HTMLInputElement>(null)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const [oldSubjectsLength, setOldSubjectsLength] = useState<number>(subjects.length)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();

  useEffect(() => {
    newSubjectNameInputRef.current?.focus()
  }, [isNewSubjectModalOpen])

  useEffect(() => {
    if (oldSubjectsLength < subjects.length) {
      handleChange(subjects[subjects.length - 1])
      console.log(subjects[subjects.length - 1])
      setOldSubjectsLength(subjects.length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects])

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const showSnackbarMessage = (message: string) => {
    setShowSnackbar(true)
    setSnackbarMessage(message)
  }

  const handleChange = (subject: iSubject) => {
    setActiveSubjectName(subject.subjectName);
    setActiveSubjectId(subject.subjectId)
    onChange && onChange(subject);
    setIsSubjectDropdownOpen(false)
  };

  const toggleDropdown = (e: any) => {
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
  }

  const validateNewSubjectSubmit = () => {
    if (newSubjectName) {
      setSubjects([...subjects, { subjectName: newSubjectName, subjectId: uuidv4(), materials: [] }])
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

  return (
    <div className={`subject-dropdown${isSubjectDropdownOpen ? ' dropdown-open' : ''}`}>
      <div className="dropdown-button" onClick={toggleDropdown}>
        <span title={activeSubjectName}>{activeSubjectName}</span>
        {isSubjectDropdownOpen ? <FontAwesomeIcon icon={faChevronUp} color={grayscale900} /> : <FontAwesomeIcon icon={faChevronDown} color={grayscale900} />}
      </div>
      <div className="aside-button new-subject-button" onClick={openNewSubjectModal}>
        <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
        <span className='new-subject-label'>Nový předmět</span>
      </div>
      <div className='dropdown-options'>
        {
          subjects.map((subject: iSubject, index: number) => {
            return (
              <div
                key={index}
                className={`dropdown-option aside-button${activeSubjectId === subject.subjectId ? ' active' : ''}`}
                onClick={() => handleChange(subject)}
              >
                <span>{subject.subjectName}</span>
              </div>
            )
          })
        }
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
  );
};
export default SubjectDropdown;
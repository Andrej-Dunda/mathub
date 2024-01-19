import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SubjectDropdown.scss'
import React, { FC, useEffect, useState } from 'react';
import { faChevronDown, faChevronUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { iSubject } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import NewSubjectModalContent from '../modal/modal-contents/NewSubjectModalContent';
import { useMaterials } from '../../contexts/MaterialsProvider';

type SubjectDropdownProps = {
  onChange?: (subject: iSubject) => void;
  isAsideMenuOpen: boolean;
  setIsAsideMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SubjectDropdown: FC<SubjectDropdownProps> = ({ isAsideMenuOpen, setIsAsideMenuOpen, onChange }) => {
  const {
    subjects,
    selectedSubject,
    setSelectedSubject
  } = useMaterials();
  const { showModal } = useModal();
  const [oldSubjectsLength, setOldSubjectsLength] = useState<number>(subjects.length)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    isAsideMenuOpen && setTimeout(() => setIsSubjectDropdownOpen(false), 350)
  }, [isAsideMenuOpen])

  useEffect(() => {
    if (oldSubjectsLength < subjects.length) {
      handleChange(subjects[subjects.length - 1])
      setOldSubjectsLength(subjects.length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects])

  const handleChange = (subject: iSubject) => {
    setSelectedSubject(subject);
    onChange && onChange(subject);
    setIsSubjectDropdownOpen(false)
  };

  const toggleDropdown = (e: any) => {
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
  }

  const openNewSubjectModal = () => {
    showModal(<NewSubjectModalContent />)
  }

  return (
    <div className={`subject-dropdown${isSubjectDropdownOpen ? ' dropdown-open' : ''}`}>
      <div className="dropdown-button" onClick={toggleDropdown}>
        <span title={selectedSubject?.subject_name}>{selectedSubject?.subject_name}</span>
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
                className={`dropdown-option aside-button${selectedSubject?._id === subject._id ? ' active' : ''}`}
                onClick={() => handleChange(subject)}
              >
                <span>{subject.subject_name}</span>
              </div>
            )
          })
        }
      </div>
    </div>
  );
};
export default SubjectDropdown;
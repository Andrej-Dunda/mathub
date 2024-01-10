import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SubjectDropdown.scss'
import React, { FC, useEffect, useState } from 'react';
import { faChevronDown, faChevronUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { iSubject } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import NewSubjectModalContent from '../modal/modal-contents/NewSubjectModalContent';

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
  const { showModal } = useModal();
  const [oldSubjectsLength, setOldSubjectsLength] = useState<number>(subjects.length)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();

  useEffect(() => {
    if (oldSubjectsLength < subjects.length) {
      handleChange(subjects[subjects.length - 1])
      console.log(subjects[subjects.length - 1])
      setOldSubjectsLength(subjects.length)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects])

  const handleChange = (subject: iSubject) => {
    setActiveSubjectName(subject.subjectName);
    setActiveSubjectId(subject.subjectId)
    onChange && onChange(subject);
    setIsSubjectDropdownOpen(false)
  };

  const toggleDropdown = (e: any) => {
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
  }

  const openNewSubjectModal = () => {
    showModal(<NewSubjectModalContent subjects={subjects} setSubjects={setSubjects} />)
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
    </div>
  );
};
export default SubjectDropdown;
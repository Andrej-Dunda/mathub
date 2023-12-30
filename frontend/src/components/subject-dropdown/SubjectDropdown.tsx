import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SubjectDropdown.scss'
import React, { useState, FC } from 'react';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { iSubject } from '../../interfaces/subjects-interface';

type DropdownProps = {
  isSubjectDropdownOpen: boolean;
  setIsSubjectDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subjects: iSubject[];
  activeSubjectName: string;
  setActiveSubjectName: React.Dispatch<React.SetStateAction<string>>;
  activeSubjectId: string;
  setActiveSubjectId: React.Dispatch<React.SetStateAction<string>>;
  onChange?: (option: iSubject) => void;
};

const SubjectDropdown: FC<DropdownProps> = ({
  isSubjectDropdownOpen,
  setIsSubjectDropdownOpen,
  subjects, activeSubjectName,
  setActiveSubjectName,
  activeSubjectId,
  setActiveSubjectId,
  onChange
}) => {
  const handleChange = (subject: iSubject) => {
    setActiveSubjectName(subject.subjectName);
    setActiveSubjectId(subject.subjectId)
    onChange && onChange(subject);
    setIsSubjectDropdownOpen(false)
  };

  const toggleDropdown = (e: any) => {
    setIsSubjectDropdownOpen(!isSubjectDropdownOpen)
  }

  return (
    <div className={ `subject-dropdown${ isSubjectDropdownOpen ? ' dropdown-open' : '' }`}>
      <div className="dropdown-button" onClick={toggleDropdown}>
        <span>{activeSubjectName}</span>
        {isSubjectDropdownOpen ? <FontAwesomeIcon icon={faChevronUp} color='black' /> : <FontAwesomeIcon icon={faChevronDown} color='black' />}
      </div>
        <div className='dropdown-options'>
          {
            subjects.map((subject: iSubject, index: number) => {
              return (
                <div
                  key={index}
                  className={`dropdown-option${ activeSubjectId === subject.subjectId ? ' active' : '' }`}
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
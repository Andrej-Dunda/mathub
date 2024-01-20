import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './SubjectDropdown.scss'
import React, { FC, useEffect, useState } from 'react';
import { faChevronDown, faChevronUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { iSubject } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import NewSubjectModalContent from '../modal/modal-contents/NewSubjectModalContent';
import { useMaterials } from '../../contexts/MaterialsProvider';
import EllipsisMenuButton from '../buttons/ellipsis-menu-button/EllipsisMenuButton';
import DeleteModalContent from '../modal/modal-contents/DeleteModalContent';

type SubjectDropdownProps = {
  onChange?: (subject: iSubject) => void;
  isAsideMenuOpen: boolean;
  onEditorTopicSwitch?: (onFinish?: any) => void;
};

const SubjectDropdown: FC<SubjectDropdownProps> = ({ isAsideMenuOpen, onEditorTopicSwitch, onChange }) => {
  const {
    subjects,
    selectedSubject,
    setSelectedSubject,
    deleteSubject
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
      setSelectedSubject(subjects[subjects.length - 1]);
      setIsSubjectDropdownOpen(false)
      onChange && onChange(subjects[subjects.length - 1])
      setOldSubjectsLength(subjects.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects])

  const handleChange = (subject: iSubject) => {
    onEditorTopicSwitch && onEditorTopicSwitch(() => {
      setSelectedSubject(subject);
      setIsSubjectDropdownOpen(false)
      onChange && onChange(subject)
    })
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
                <EllipsisMenuButton
                  className='dropdown-option-ellipsis-menu-button'
                  light={selectedSubject?._id === subject._id ? false : true}
                  onClick={(e) => e.stopPropagation()}
                  menuOptions={[
                    {
                      name: 'Smazat',
                      icon: faTrash,
                      onClick: () => showModal(
                        <DeleteModalContent
                          onSubmit={() => deleteSubject(subject._id)}
                          submitButtonLabel='Smazat'
                          cancelButtonLabel='Zrušit'
                          title={`Smazat předmět "${subject.subject_name}"?`}
                          content='Opravdu chcete smazat tento předmět? Tato akce je nevratná!'
                        />
                      )
                    }
                  ]} />
              </div>
            )
          })
        }
      </div>
    </div>
  );
};
export default SubjectDropdown;
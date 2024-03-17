import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './MaterialDropdown.scss'
import React, { FC, useEffect, useState } from 'react';
import { faChevronDown, faChevronUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { iMaterial } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import NewMaterialModalContent from '../modal/modal-contents/NewMaterialModalContent';
import { useMaterials } from '../../contexts/MaterialsProvider';
import EllipsisMenuButton from '../buttons/ellipsis-menu-button/EllipsisMenuButton';
import DeleteModalContent from '../modal/modal-contents/DeleteModalContent';

type MaterialDropdownProps = {
  onChange?: (material: iMaterial) => void;
  isAsideMenuOpen: boolean;
  onEditorTopicSwitch?: (onFinish?: any) => void;
};

const MaterialDropdown: FC<MaterialDropdownProps> = ({ isAsideMenuOpen, onEditorTopicSwitch, onChange }) => {
  const {
    materials,
    selectedMaterial,
    setSelectedMaterial,
    deleteMaterial
  } = useMaterials();
  const { showModal } = useModal();
  const [oldMaterialsLength, setOldMaterialsLength] = useState<number>(materials.length)
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    isAsideMenuOpen && setTimeout(() => setIsMaterialDropdownOpen(false), 350)
  }, [isAsideMenuOpen])

  useEffect(() => {
    if (oldMaterialsLength < materials.length) {
      setSelectedMaterial(materials[materials.length - 1]);
      setIsMaterialDropdownOpen(false)
      onChange && onChange(materials[materials.length - 1])
      setOldMaterialsLength(materials.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials])

  const handleChange = (material: iMaterial) => {
    material._id !== selectedMaterial?._id ? onEditorTopicSwitch && onEditorTopicSwitch(() => {
      setSelectedMaterial(material);
      setIsMaterialDropdownOpen(false)
      onChange && onChange(material)
    }) : setIsMaterialDropdownOpen(false)
  };

  const toggleDropdown = (e: any) => {
    setIsMaterialDropdownOpen(!isMaterialDropdownOpen)
  }

  const openNewMaterialModal = () => {
    showModal(<NewMaterialModalContent />)
  }

  return (
    <div className={`material-dropdown${isMaterialDropdownOpen ? ' dropdown-open' : ''}`}>
      <div className="dropdown-button" onClick={toggleDropdown}>
        <span title={selectedMaterial?.material_name}>{selectedMaterial?.material_name}</span>
        {isMaterialDropdownOpen ? <FontAwesomeIcon icon={faChevronUp} color={grayscale900} /> : <FontAwesomeIcon icon={faChevronDown} color={grayscale900} />}
      </div>
      <div className="aside-button new-material-button" onClick={openNewMaterialModal}>
        <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
        <span className='new-material-label'>Nový materiál</span>
      </div>
      <div className='dropdown-options'>
        {
          materials.map((material: iMaterial, index: number) => {
            return (
              <div
                key={index}
                className={`dropdown-option aside-button${selectedMaterial?._id === material._id ? ' active' : ''}`}
                onClick={() => handleChange(material)}
              >
                <span>{material.material_name}</span>
                <EllipsisMenuButton
                  className='dropdown-option-ellipsis-menu-button'
                  light={selectedMaterial?._id === material._id ? false : true}
                  onClick={(e) => e.stopPropagation()}
                  menuOptions={[
                    {
                      name: 'Smazat',
                      icon: faTrash,
                      onClick: () => showModal(
                        <DeleteModalContent
                          onSubmit={() => deleteMaterial(material._id)}
                          submitButtonLabel='Smazat'
                          cancelButtonLabel='Zrušit'
                          title={`Smazat předmět "${material.material_name}"?`}
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
export default MaterialDropdown;
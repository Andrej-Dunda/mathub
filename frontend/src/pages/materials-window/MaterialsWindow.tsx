import './MaterialsWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRef, useEffect, useState } from 'react';
import { iMaterial } from '../../interfaces/materials-interface';
import EllipsisMenuButton from '../../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import { useNav } from '../../contexts/NavigationProvider';
import { useModal } from '../../contexts/ModalProvider';
import NewMaterialModalContent from '../../components/modal/modal-contents/NewMaterialModalContent';
import { useMaterials } from '../../contexts/MaterialsProvider';
import DeleteModalContent from '../../components/modal/modal-contents/DeleteModalContent';
import httpClient from '../../utils/httpClient';
import MaterialPost from '../../components/material-post/MaterialPost';
import EditMaterialModalContent from '../../components/modal/modal-contents/EditMaterialModalContent';

const MaterialsWindow = () => {
  const { materials, getMaterials, setSelectedMaterial, deleteMaterial } = useMaterials();
  const [followedMaterials, setFollowedMaterials] = useState<iMaterial[]>([])
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const grayscale300 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-300').trim();
  const { toViewMaterials, setActiveLink } = useNav();
  const { showModal, modalOpen } = useModal();

  useEffect(() => {
    setActiveLink('/materials')
    getMaterials()
    getFollowedMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActiveLink])

  useEffect(() => {
    newMaterialNameInputRef.current?.focus()
  }, [modalOpen])

  const getFollowedMaterials = () => {
    httpClient.get('/api/get-followed-materials')
      .then(res => {
        setFollowedMaterials(res.data)
      })
      .catch(err => console.error(err))
  }

  const openNewMaterialModal = () => {
    showModal(<NewMaterialModalContent />)
  }

  const openDeleteMaterialModal = (material: iMaterial) => {
    showModal(
      <DeleteModalContent
        onSubmit={() => deleteMaterial(material._id)}
        submitButtonLabel='Smazat'
        cancelButtonLabel='Zrušit'
        title={`Smazat materiál "${material.material_name}"?`}
        content='Opravdu chcete smazat tento materiál? Tato akce je nevratná!'
      />
    )
  }

  const openEditMaterialModal = (material: iMaterial) => {
    showModal(<EditMaterialModalContent material={material} />)
  }

  const openMaterial = (material: iMaterial) => {
    setSelectedMaterial(material)
    toViewMaterials()
  }

  return (
    <div className="materials-window">
      <h1 className='h1'>Moje materiály</h1>
      <div className="my-materials">
        {
          materials.map((material: iMaterial, index: number) => {
            return (
              <div key={index} className="material-button">
                <header>
                  <EllipsisMenuButton menuOptions={[
                    {
                      name: 'Smazat',
                      icon: faTrash,
                      onClick: () => openDeleteMaterialModal(material)
                    },
                    {
                      name: 'Upravit',
                      icon: faEdit,
                      onClick: () => openEditMaterialModal(material)
                    }
                  ]} />
                </header>
                <div className="material-button-body" onClick={() => openMaterial(material)} title={material.material_name}>
                  <main>
                    <h5>
                      {material.material_name}
                    </h5>
                  </main>
                  <footer className='material-button-footer'>
                    <span className='material-subject'>
                      {material.material_subject}
                    </span>
                    <span className='material-grade'>
                      {material.material_grade}
                    </span>
                  </footer>
                </div>
              </div>
            )
          })
        }
        <button type='button' className="add-material-button" onClick={openNewMaterialModal}>
          <FontAwesomeIcon icon={faPlus} className='edit-icon' size="2x" color={grayscale300} />
        </button>
      </div>
      <hr />
      <h1 className='h1'>Sledované materiály</h1>
      {
        followedMaterials.length ?
          <div className="followed-materials">
            {
              followedMaterials.map((material: iMaterial, index: number) => {
                return (
                  <MaterialPost key={index} material={material} onStopFollowing={getFollowedMaterials} />
                )
              })
            }
          </div> : <span className='no-followed-materials'>Nesledujete žádné materiály.</span>
      }
    </div>
  )
}
export default MaterialsWindow;
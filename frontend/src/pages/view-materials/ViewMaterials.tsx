import { useEffect, useRef, useState } from 'react'
import './ViewMaterials.scss'
import AsideMenu from '../../components/aside-menu/AsideMenu';
import MainContent from '../../components/main-content/MainContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/modal/Modal';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import SubjectDropdown from '../../components/subject-dropdown/SubjectDropdown';
import { iMaterial, iSubject } from '../../interfaces/materials-interface';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from '../../contexts/SnackbarProvider';

const ViewMaterials = () => {
  const { openSnackbar } = useSnackbar();
  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)
  const [activeSubjectName, setActiveSubjectName] = useState<string>('')
  const [activeSubjectId, setActiveSubjectId] = useState<string>('')
  const [activeMaterials, setActiveMaterials] = useState<iMaterial[]>([])
  const ekonomieMaterials: iMaterial[] = [
    { materialId: 'id-1', materialName: '1. Základní ekonomické pojmy' },
    { materialId: 'id-2', materialName: '2. Výroba, výrobní proces' },
    { materialId: 'id-3', materialName: '3. Trh a jeho charakteristika' },
    { materialId: 'id-4', materialName: '4. Mzda a její formy' },
    { materialId: 'id-5', materialName: '5. Charakteristika podnikání' },
    { materialId: 'id-6', materialName: '6. Podniky a jejich dělení' },
    { materialId: 'id-7', materialName: '7. Hospodaření podniku' },
    { materialId: 'id-8', materialName: '8. Činnosti podniku' },
    { materialId: 'id-9', materialName: '9. Evidence zásob a dlouhodobého hmotného majetku' },
    { materialId: 'id-10', materialName: '10. Finanční gramotnost' },
    { materialId: 'id-11', materialName: '11. Daňová soustava ČR' },
    { materialId: 'id-12', materialName: '12. Bankovnictví' },
    { materialId: 'id-13', materialName: '13. Management' },
    { materialId: 'id-14', materialName: '14. Vnitrostátní a zahraniční obchod' },
    { materialId: 'id-15', materialName: '15. Pojišťovnictví' },
    { materialId: 'id-16', materialName: '16. Cenné papíry' },
    { materialId: 'id-17', materialName: '17. Marketing' },
    { materialId: 'id-18', materialName: '18. Pracovněprávní vztahy' },
    { materialId: 'id-19', materialName: '19. Sociální systém' },
    { materialId: 'id-20', materialName: '20. Vybrané ekonomické teorie' }
  ]
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number>(0)
  const [activeMaterial, setActiveMaterial] = useState<iMaterial | undefined>()
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState<boolean>(false);
  const [newMaterialName, setNewMaterialName] = useState<string>('')
  const [newMaterialModalError, setNewMaterialModalError] = useState<string>('')
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const [oldMaterialsLength, setOldMaterialsLength] = useState<number>(activeMaterials.length)
  const elementRefs = useRef<Array<HTMLElement | null>>([]);
  const [subjects, setSubjects] = useState<iSubject[]>([
    {subjectName: 'Češtinaalskdjhgljkhalskdjfhlakjhdsfadflgkjhaldkjgh', subjectId: 'id-cestina', materials: [{ materialId: 'id-1', materialName: '1. Literatura 2. poloviny 20. století' }]},
    {subjectName: 'Ekonomie', subjectId: 'id-ekonomie', materials: ekonomieMaterials},
    {subjectName: 'Informatika', subjectId: 'id-informatika', materials: [{ materialId: 'id-1', materialName: '1. Hardware' }]},
    {subjectName: 'Angličtina', subjectId: 'id-anglictina', materials: [{ materialId: 'id-1', materialName: '1. Schools and Education' }]},
    {subjectName: 'Matematika', subjectId: 'id-matematika', materials: [{ materialId: 'id-1', materialName: '1. Kombinatorika a pravděpodobnost' }]},
  ])
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false)
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();

  useEffect(() => {
    let activeSubject: iSubject = subjects.find(subject => subject.subjectId === activeSubjectId) || subjects[0];
    setActiveMaterials(activeSubject.materials)
  }, [activeSubjectId, subjects])

  useEffect(() => {
    elementRefs.current = elementRefs.current.slice(0, activeMaterials.length);
    selectMaterial(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMaterials]);

  useEffect(() => {
    setActiveSubjectName(subjects[1].subjectName)
    setActiveSubjectId(subjects[1].subjectId)
    setActiveMaterialIndex(0)
    setTimeout(() => setIsAsideMenuOpen(false), 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    newMaterialNameInputRef.current?.focus()
  }, [isNewMaterialModalOpen])

  useEffect(() => {
    if (oldMaterialsLength === activeMaterials.length - 1) {
      selectMaterial(activeMaterials.length - 1)
      scrollToElement(activeMaterials.length - 1);
    }
    setOldMaterialsLength(activeMaterials.length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMaterials, oldMaterialsLength])

  useEffect(() => {
    isAsideMenuOpen && setTimeout(() => setIsSubjectDropdownOpen(false), 350)
  }, [isAsideMenuOpen])

  const scrollToElement = (index: number) => {
    const element = elementRefs.current[index];
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateNewMaterialSubmit = () => {
    if (newMaterialName) {
      setSubjects(subjects => 
        subjects.map(subject => 
          subject.subjectId === activeSubjectId
            ? { ...subject, materials: [...subject.materials, { materialId: uuidv4(), materialName: newMaterialName }] }
            : subject
        )
      );
      setIsNewMaterialModalOpen(false)
      setNewMaterialName('')
      setNewMaterialModalError('')
      openSnackbar('Materiál úspěšně vytvořen!')
      return;
    }
    setNewMaterialModalError('Vyplňte pole Název nového materiálu!')
    newMaterialNameInputRef.current?.focus()
  }

  const onNewMaterialNameInputChange = (e: any) => {
    setNewMaterialName(e.target.value)
  }

  const openNewMaterialModal = () => {
    setIsNewMaterialModalOpen(true)
    setNewMaterialModalError('')
  }

  const closeNewMaterialModal = () => {
    setIsNewMaterialModalOpen(false)
    setNewMaterialName('')
  }

  const selectMaterial = (index: number) => {
    if (index !== activeMaterialIndex) {
      setActiveMaterialIndex(index);
      setActiveMaterial(activeMaterials[index])
    }
  }

  return (
    <div className={`view-materials ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
      <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
        <div className="aside-header">
          <SubjectDropdown
            isSubjectDropdownOpen={isSubjectDropdownOpen}
            setIsSubjectDropdownOpen={setIsSubjectDropdownOpen}
            subjects={subjects}
            setSubjects={setSubjects}
            activeSubjectName={activeSubjectName}
            setActiveSubjectName={setActiveSubjectName}
            activeSubjectId={activeSubjectId}
            setActiveSubjectId={setActiveSubjectId}
            onChange={(subject) => console.log(subject)}
          />
          <div className="aside-button new-material-button" onClick={openNewMaterialModal}>
            <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
            <span className='new-material-label'>Nový materiál</span>
          </div>
        </div>
        <div className="aside-body">
          {
            activeMaterials.map((material: iMaterial, index) => {
              return (
                <div
                  key={index}
                  className={`aside-button material-button ${index === activeMaterialIndex ? 'active' : ''}`}
                  title={material.materialName}
                  onClick={() => selectMaterial(index)}
                  ref={el => (elementRefs.current[index] = el)}
                >
                  <span>{material.materialName}</span>
                </div>
              )
            })
          }
        </div>
      </AsideMenu>
      <MainContent>
        <div className="main-content-header">
          <span className='material-title'>{activeMaterial?.materialName}</span>
        </div>
        <div className="main-content-body">
          main content
        </div>
      </MainContent>
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
    </div>
  )
}
export default ViewMaterials;
import { useEffect, useRef, useState } from 'react'
import './ViewMaterials.scss'
import AsideMenu from '../../components/aside-menu/AsideMenu';
import MainContent from '../../components/main-content/MainContent';
import Snackbar from '../../components/snack-bar/SnackBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../components/modal/Modal';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import SubjectDropdown from '../../components/subject-dropdown/SubjectDropdown';
import { iSubject } from '../../interfaces/subjects-interface';

const ViewMaterials = () => {
  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const [activeSubjectName, setActiveSubjectName] = useState<string>('')
  const [activeSubjectId, setActiveSubjectId] = useState<string>('')
  const [materialNames, setMaterialNames] = useState<string[]>([
    '1. Základní ekonomické pojmy',
    '2. Výroba, výrobní proces',
    '3. Trh a jeho charakteristika',
    '4. Mzda a její formy',
    '5. Charakteristika podnikání',
    '6. Podniky a jejich dělení',
    '7. Hospodaření podniku',
    '8. Činnosti podniku',
    '9. Evidence zásob a dlouhodobého hmotného majetku',
    '10. Finanční gramotnost',
    '11. Daňová soustava ČR',
    '12. Bankovnictví',
    '13. Management',
    '14. Vnitrostátní a zahraniční obchod',
    '15. Pojišťovnictví',
    '16. Cenné papíry',
    '17. Marketing',
    '18. Pracovněprávní vztahy',
    '19. Sociální systém',
    '20. Vybrané ekonomické teorie'
  ])
  const [activeMaterialId, setActiveMaterialId] = useState<number>(0)
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState<boolean>(false);
  const [newMaterialName, setNewMaterialName] = useState<string>('')
  const [newMaterialModalError, setNewMaterialModalError] = useState<string>('')
  const newMaterialNameInputRef = useRef<HTMLInputElement>(null)
  const [oldMaterialNamesLength, setOldMaterialNamesLength] = useState<number>(materialNames.length)
  const elementRefs = useRef<Array<HTMLElement | null>>([]);
  const [subjects, setSubjects] = useState<iSubject[]>([
    {subjectName: 'Češtinaalskdjhgljkhalskdjfhlakjhdsfadflgkjhaldkjgh', subjectId: 'id-cestina'},
    {subjectName: 'Ekonomie', subjectId: 'id-ekonomie'},
    {subjectName: 'Informatika', subjectId: 'id-informatika'},
    {subjectName: 'Angličtina', subjectId: 'id-anglictina'},
    {subjectName: 'Matematika', subjectId: 'id-matematika'}
  ])
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    elementRefs.current = elementRefs.current.slice(0, materialNames.length);
  }, [materialNames]);

  useEffect(() => {
    setActiveSubjectName(subjects[1].subjectName)
    setActiveSubjectId(subjects[1].subjectId)
    setActiveMaterialId(0)
    setTimeout(() => setIsAsideMenuOpen(false), 200);
  }, [subjects])

  useEffect(() => {
    newMaterialNameInputRef.current?.focus()
  }, [isNewMaterialModalOpen])

  useEffect(() => {
    if (oldMaterialNamesLength < materialNames.length) {
      setActiveMaterialId(materialNames.length - 1)
      scrollToElement(materialNames.length - 1);
      setOldMaterialNamesLength(materialNames.length)
    }
  }, [materialNames, oldMaterialNamesLength])

  useEffect(() => {
    isAsideMenuOpen && setTimeout(() => setIsSubjectDropdownOpen(false), 350)
  }, [isAsideMenuOpen])

  const scrollToElement = (index: number) => {
    const element = elementRefs.current[index];
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateNewMaterialSubmit = () => {
    if (newMaterialName) {
      setMaterialNames([...materialNames, newMaterialName])
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

  const selectMaterial = (id: number) => {
    id !== activeMaterialId && setActiveMaterialId(id);
  }

  return (
    <div className={`view-materials ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
      <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
        <div className="aside-header">
          <SubjectDropdown
            isSubjectDropdownOpen={isSubjectDropdownOpen}
            setIsSubjectDropdownOpen={setIsSubjectDropdownOpen}
            subjects={subjects}
            activeSubjectName={activeSubjectName}
            activeSubjectId={activeSubjectId}
            setActiveSubjectId={setActiveSubjectId}
            setActiveSubjectName={setActiveSubjectName}
            onChange={(subject) => console.log(subject)}
          />
          <div className="aside-button new-material-button" onClick={openNewMaterialModal}>
            <FontAwesomeIcon icon={faPlus} color='gray' className='plus-icon' />
            <span className='new-material-label'>Nový materiál</span>
          </div>
        </div>
        <div className="aside-body">
          {
            materialNames.map((materialName: string, index: number) => {
              return (
                <div
                  key={index}
                  id={`material-button-${index}`}
                  className={`aside-button material-button ${index === activeMaterialId ? 'active' : ''}`}
                  title={materialName}
                  onClick={() => selectMaterial(index)}
                  ref={el => (elementRefs.current[index] = el)}
                >
                  <span>{materialName}</span>
                </div>
              )
            })
          }
        </div>
      </AsideMenu>
      <MainContent>
        main content
      </MainContent>
      <Snackbar
        message={snackbarMessage}
        onClose={handleCloseSnackbar}
        showSnackbar={showSnackbar}
        setShowSnackbar={setShowSnackbar}
      />
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
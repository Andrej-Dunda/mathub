import './SaveTopicModalContent.scss'
import { useMaterials } from '../../../contexts/MaterialsProvider';
import ModalFooter from '../modal-footer/ModalFooter';
import { useModal } from '../../../contexts/ModalProvider';

type SaveTopicModalContentProps = {
  saveTopic: () => void;
  dontSaveTopic?: () => void;
  onFinish: any;
}
const SaveTopicModalContent: React.FC<SaveTopicModalContentProps> = ({ saveTopic, dontSaveTopic, onFinish }) => {
  const { selectedTopic } = useMaterials();
  const { closeModal } = useModal();

  const handleSubmit = () => {
    saveTopic()
    onFinish()
    closeModal()
  }

  const hadnleCancel = () => {
    dontSaveTopic && dontSaveTopic()
    onFinish()
    closeModal()
  }

  return (
    <div className="save-topic-modal-content">
      <h1 className='title'>Uložit téma</h1>
      <p className='content'>Přejete si uložit změny v tématu "{selectedTopic?.topic_name}"?</p>
      <ModalFooter
        onClose={hadnleCancel}
        onSubmit={handleSubmit}
        submitButtonLabel='Uložit'
        cancelButtonLabel='Zahodit změny'
      />
    </div>
  )
}
export default SaveTopicModalContent;
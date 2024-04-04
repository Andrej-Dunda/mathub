import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMaterials } from '../../contexts/MaterialsProvider';
import { useModal } from '../../contexts/ModalProvider';
import { iTopic } from '../../interfaces/materials-interface';
import EllipsisMenuButton from '../buttons/ellipsis-menu-button/EllipsisMenuButton'
import DeleteModalContent from '../modal/modal-contents/DeleteModalContent';
import EditTopicModalContent from '../modal/modal-contents/EditTopicModalContent';
import './TopicDropdownItem.scss'
import { useState } from 'react';

type TopicDropdownItemProps = {
  topic: iTopic;
}

const TopicDropdownItem = ({ topic }: TopicDropdownItemProps) => {
  const { showModal } = useModal();
  const { deleteTopic, selectedTopic } = useMaterials();
  const [topicName, setTopicName] = useState(topic.topic_name)

  const openDeleteTopicModal = (topic: iTopic) => {
    showModal(
      <DeleteModalContent
        onSubmit={() => deleteTopic(topic._id)}
        submitButtonLabel='Smazat'
        cancelButtonLabel='Zrušit'
        title={`Smazat téma "${topic.topic_name}"?`}
        content='Opravdu chcete smazat toto téma? Tato akce je nevratná!'
      />
    )
  }

  const openEditTopicModal = () => {
    showModal(<EditTopicModalContent topic={topic} setNewTopicName={setTopicName} />)
  }

  return (
    <>
      <span>{topicName}</span>
      <EllipsisMenuButton
        className='topic-button-ellipsis'
        onClick={(e) => e.stopPropagation()}
        light={topic._id === selectedTopic?._id ? false : true}
        menuOptions={[
          {
            name: 'Smazat',
            icon: faTrash,
            onClick: () => openDeleteTopicModal(topic)
          },
          {
            name: 'Upravit',
            icon: faEdit,
            onClick: () => openEditTopicModal()
          }
        ]} />
    </>
  )
}

export default TopicDropdownItem

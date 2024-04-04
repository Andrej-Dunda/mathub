import { useMaterials } from '../../../contexts/MaterialsProvider';
import { useModal } from '../../../contexts/ModalProvider';
import { iTopic } from '../../../interfaces/materials-interface'
import ErrorMessage from '../../error-message/ErrorMessage';
import ModalFooter from '../modal-footer/ModalFooter';
import './EditTopicModalContent.scss'
import React, { useState } from 'react'

type EditTopicModalProps = {
  topic: iTopic;
  setNewTopicName: React.Dispatch<React.SetStateAction<string>>;
}

const EditTopicModal = ({ topic, setNewTopicName }: EditTopicModalProps) => {
  const [topicName, setTopicName] = useState(topic.topic_name)
  const [errorMessage, setErrorMessage] = useState('')
  const { closeModal } = useModal()
  const { putTopic } = useMaterials()

  const handleSubmit = () => {
    if (topicName === topic.topic_name) {
      closeModal()
      return
    }
    if (topicName === '') {
      setErrorMessage('Název tématu nesmí být prázdný!')
      return
    }
    putTopic(topic._id, topicName, topic.topic_content, true)
    setNewTopicName(topicName)
    closeModal()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicName(e.target.value)
  }

  return (
    <div className='edit-topic-modal-content'>
      <h1 className="title">Upravit téma</h1>
      <div className="topic-name-input-wrapper">
        <label htmlFor="topic-name-input">Název:</label>
        <input type="text" id='topic-name-input' className='topic-name-input' value={topicName} onChange={handleInputChange} maxLength={50} />
      </div>
      <ErrorMessage content={errorMessage} />
      <ModalFooter
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitButtonLabel='Uložit'
        cancelButtonLabel='Zrušit'
      />
    </div>
  )
}

export default EditTopicModal

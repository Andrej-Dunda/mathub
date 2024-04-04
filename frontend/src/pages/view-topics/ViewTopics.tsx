import { useEffect, useRef, useState } from 'react'
import './ViewTopics.scss'
import AsideMenu from '../../components/layout-components/aside-menu/AsideMenu';
import MainContent from '../../components/layout-components/main-content/MainContent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import ErrorMessage from '../../components/error-message/ErrorMessage';
import MaterialDropdown from '../../components/material-dropdown/MaterialDropdown';
import { iTopic } from '../../interfaces/materials-interface';
import { useModal } from '../../contexts/ModalProvider';
import ModalFooter from '../../components/modal/modal-footer/ModalFooter';
import { useMaterials } from '../../contexts/MaterialsProvider';
import SaveTopicModalContent from '../../components/modal/modal-contents/SaveTopicModalContent';
// Wysiwyg editor
import "./react-draft-wysiwyg.css";
import { Editor as WysiwygEditor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import TopicDropdownItem from '../../components/topic-dropdown-item/TopicDropdownItem';

const ViewTopics: React.FC = () => {
  const {
    getMaterials,
    selectedMaterial,
    topics,
    selectedTopic,
    getTopic,
    postTopic,
    putTopic,
  } = useMaterials();
  const [oldTopicsLength, setOldTopicsLength] = useState<number>(topics.length)
  const topicsRefs = useRef<Array<HTMLElement | null>>([]);
  const [topicEditorState, setTopicEditorState] = useState<EditorState>(EditorState.createEmpty())
  const [activeTopicContent, setActiveTopicContent] = useState<string>('')

  const [isAsideMenuOpen, setIsAsideMenuOpen] = useState<boolean>(true)
  const grayscale400 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-400').trim();
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();
  const { showModal } = useModal();

  const editorLabels = {
    // Generic
    'generic.add': 'Přidat',
    'generic.cancel': 'Zrušit',
  
    // BlockType
    'components.controls.blocktype.h1': 'Nadpis 1',
    'components.controls.blocktype.h2': 'Nadpis 2',
    'components.controls.blocktype.h3': 'Nadpis 3',
    'components.controls.blocktype.h4': 'Nadpis 4',
    'components.controls.blocktype.h5': 'Nadpis 5',
    'components.controls.blocktype.h6': 'Nadpis 6',
    'components.controls.blocktype.blockquote': 'Blockquote',
    'components.controls.blocktype.code': 'Kód',
    'components.controls.blocktype.blocktype': 'Block Type',
    'components.controls.blocktype.normal': 'Normální',
  
    // Color Picker
    'components.controls.colorpicker.colorpicker': 'Barva písma',
    'components.controls.colorpicker.text': 'Text',
    'components.controls.colorpicker.background': 'Zvýraznit',
  
    // Embedded
    'components.controls.embedded.embedded': 'Vložený',
    'components.controls.embedded.embeddedlink': 'Vložit odkaz',
    'components.controls.embedded.enterlink': 'Vložte odkaz',
  
    // Emoji
    'components.controls.emoji.emoji': 'Emoji',
  
    // FontFamily
    'components.controls.fontfamily.fontfamily': 'Font',
  
    // FontSize
    'components.controls.fontsize.fontsize': 'Velikost fontu',
  
    // History
    'components.controls.history.history': 'Historie',
    'components.controls.history.undo': 'Zpět',
    'components.controls.history.redo': 'Vpřed',
  
    // Image
    'components.controls.image.image': 'Obrázek',
    'components.controls.image.fileUpload': 'Nahrát soubor',
    'components.controls.image.byURL': 'URL',
    'components.controls.image.dropFileText': 'Přetáhněte soubor nebo klikněte pro nahrání',
  
    // Inline
    'components.controls.inline.bold': 'Tučný',
    'components.controls.inline.italic': 'Kurzíva',
    'components.controls.inline.underline': 'Podtržený',
    'components.controls.inline.strikethrough': 'Přeškrtnutý',
    'components.controls.inline.monospace': 'Monospace',
    'components.controls.inline.superscript': 'Superscript',
    'components.controls.inline.subscript': 'Subscript',
  
    // Link
    'components.controls.link.linkTitle': 'Název odkazu',
    'components.controls.link.linkTarget': 'URL odkazu',
    'components.controls.link.linkTargetOption': 'Otevřít odkaz v novém okně',
    'components.controls.link.link': 'Odkaz',
    'components.controls.link.unlink': 'Odebrat odkaz',
  
    // List
    'components.controls.list.list': 'Seznam',
    'components.controls.list.unordered': 'Neuspořádaný',
    'components.controls.list.ordered': 'Uspořádaný',
    'components.controls.list.indent': 'Odsadit',
    'components.controls.list.outdent': 'Zmenšit odsazení',
  
    // Remove
    'components.controls.remove.remove': 'Odstranit',
  
    // TextAlign
    'components.controls.textalign.textalign': 'Zarovnání textu',
    'components.controls.textalign.left': 'Vlevo',
    'components.controls.textalign.center': 'Na střed',
    'components.controls.textalign.right': 'Vpravo',
    'components.controls.textalign.justify': 'Do bloku',
  };

  useEffect(() => {
    getMaterials()
    setTimeout(() => setIsAsideMenuOpen(false), 200);

    const saveShortcut = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && selectedTopic?.topic_content !== activeTopicContent) {
        e.preventDefault()
        saveTopic()
      }
    }

    window.addEventListener('keydown', saveShortcut)

    return () => {
      window.removeEventListener('keydown', saveShortcut)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    topicsRefs.current = topicsRefs.current.slice(0, topics.length);
  }, [topics]);

  useEffect(() => {
    if (oldTopicsLength === topics.length - 1) {
      getTopic(topics[topics.length - 1]._id)
      scrollToElement(topics.length - 1);
    }
    setOldTopicsLength(topics.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topics, oldTopicsLength])

  useEffect(() => {
    if (selectedTopic) {
      setActiveTopicContent(selectedTopic.topic_content)
      setTopicEditorState(EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(selectedTopic.topic_content || '<p></p>').contentBlocks)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic?._id])

  const onEditorTopicSwitch = (onFinish?: any) => {
    if (selectedTopic?.topic_content !== activeTopicContent) {
      return showModal(<SaveTopicModalContent saveTopic={saveTopic} onFinish={onFinish} />);
    }
    onFinish && onFinish();
  }

  const saveTopic = (keepTopicSelected?: boolean) => {
    if (selectedTopic) {
      putTopic(selectedTopic._id, selectedTopic.topic_name, activeTopicContent, keepTopicSelected)
    }
  }

  const scrollToElement = (index: number) => {
    const element = topicsRefs.current[index];
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const openNewTopicModal = () => {
    showModal(<NewTopicModalContent />)
  }

  const NewTopicModalContent: React.FC = () => {
    const [newTopicName, setNewTopicName] = useState<string>('')
    const [newTopicModalError, setNewTopicModalError] = useState<string>('')
    const newTopicNameInputRef = useRef<HTMLInputElement>(null)
    const { closeModal } = useModal();

    useEffect(() => {
      newTopicNameInputRef.current?.focus()
    }, [])

    const submitNewTopic = () => {
      if (newTopicName.trim() && selectedMaterial) {
        postTopic(selectedMaterial._id, newTopicName.trim())
        closeModal()
        return
      }
      setNewTopicModalError('Vyplňte pole Název nového tématu!')
      newTopicNameInputRef.current?.focus()
    }

    return (
      <div className="new-topic-form">
        <h1 className='h1'>Nové téma</h1>
        <div className='new-topic-wrapper'>
          <label htmlFor="new-topic-name-input">Název nového tématu:</label>
          <input
            type='text'
            id='new-topic-name-input'
            name='new-topic-name-input'
            value={newTopicName}
            onChange={(e: any) => setNewTopicName(e.target.value)}
            ref={newTopicNameInputRef}
            maxLength={50}
          />
        </div>
        <ErrorMessage content={newTopicModalError} />
        <ModalFooter onSubmit={submitNewTopic} submitButtonLabel='Přidat téma' cancelButtonLabel='Zrušit' />
      </div>
    )
  }

  const onEditorStateChange = (newState: any) => {
    setTopicEditorState(newState);
    setActiveTopicContent(draftToHtml(convertToRaw(newState.getCurrentContent())));
  }

  const handleTopicChange = (topic_id: string) => {
    topic_id !== selectedTopic?._id && onEditorTopicSwitch(() => getTopic(topic_id))
  }

  return (
    <div className={`view-topics ${isAsideMenuOpen ? 'aside-menu-open' : ''}`}>
      <AsideMenu isAsideMenuOpen={isAsideMenuOpen} setIsAsideMenuOpen={setIsAsideMenuOpen} >
        <div className="aside-header">
          <MaterialDropdown isAsideMenuOpen={isAsideMenuOpen} onEditorTopicSwitch={onEditorTopicSwitch} />
          <div className="aside-button new-topic-button" onClick={openNewTopicModal}>
            <FontAwesomeIcon icon={faPlus} color={grayscale400} className='plus-icon' />
            <span className='new-topic-label'>Nové téma</span>
          </div>
        </div>
        <div className="aside-body">
          {
            topics.map((topic: iTopic, index) => {
              return (
                <div
                  key={index}
                  className={`aside-button topic-button ${topic._id === selectedTopic?._id ? 'active' : ''}`}
                  title={topic.topic_name.trim() && topic.topic_name.trim()}
                  onClick={() => handleTopicChange(topic._id)}
                  ref={el => (topicsRefs.current[index] = el)}
                >
                  <TopicDropdownItem
                    topic={topic}
                  />
                </div>
              )
            })
          }
        </div>
      </AsideMenu>
      <MainContent>
        <div className="main-content-header">
          <span className='topic-title'>{selectedTopic?.topic_name}</span>
          <button
            className={`save-button ${activeTopicContent === selectedTopic?.topic_content ? '' : 'not-saved'}`}
            onClick={() => activeTopicContent !== selectedTopic?.topic_content && saveTopic(true)}
          >
            <FontAwesomeIcon icon={faSave} color={activeTopicContent === selectedTopic?.topic_content ? grayscale900 : grayscale100} className='save-icon' />
            <span className='label'>Uložit</span>
          </button>
        </div>
        <div className="main-content-body">
          <div className="wysiwyg-wrapper">
            <WysiwygEditor
              editorState={topicEditorState}
              toolbarClassName="topic-editor-toolbar"
              wrapperClassName="topic-editor-wrapper"
              editorClassName="topic-editor-content"
              onEditorStateChange={(newState) => onEditorStateChange(newState)}
              localization={{ locale: 'cz', translations: editorLabels }}
            />
          </div>
        </div>
      </MainContent>
    </div>
  )
}

export default ViewTopics;
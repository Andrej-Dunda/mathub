import { useEffect, useState } from 'react';
import './TextParagraph.scss'

interface iTextParagraph {
  className?: string;
  text: string;
  characterLimit?: number;
  onShowMoreToggle?: () => void;
}

const TextParagraph: React.FC<iTextParagraph> = ({ className, text, characterLimit, onShowMoreToggle }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    onShowMoreToggle && onShowMoreToggle();
  }, [isExpanded, onShowMoreToggle])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <p className={`text-paragraph ${className}`}>
      {
        characterLimit && text && text.length > characterLimit && !isExpanded ? (
          <>
            {text.substring(0, characterLimit)}
          </>
        ) : (
          text
        )
      }
      {
        characterLimit && text && text.length > characterLimit ? (
          <span className='show-more' onClick={toggleExpand}>
            {isExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
          </span>
        ) : null
      }
    </p>
  )
}
export default TextParagraph;
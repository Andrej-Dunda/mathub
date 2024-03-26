import React from 'react'
import './ToggleTopicsButton.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

type ToggleTopicsButtonProps = {
  topicsVisible: boolean;
  setTopicsVisible: (value: boolean) => void;
}

const ToggleTopicsButton = ({ topicsVisible, setTopicsVisible }: ToggleTopicsButtonProps) => {
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  return (
    <button className={`toggle-topics-button ${topicsVisible ? 'dark' : 'light'}`} onClick={() => setTopicsVisible(!topicsVisible)}>
      <FontAwesomeIcon icon={faBookOpen} color={topicsVisible ? grayscale100 : grayscale900} />
    </button>
  )
}

export default ToggleTopicsButton

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Checkbox.scss'
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { MouseEventHandler } from 'react';

interface CheckboxProps {
  checked: boolean;
  onToggle: MouseEventHandler<any>;
  className?: string;
  label?: string;
}

const Checkbox = ({ checked, onToggle, className, label }: CheckboxProps) => {
  return (
    <div id='checkbox' className={`checkbox ${className}`} onClick={onToggle}>
      <div className="checkbox-icon-wrapper">
        {checked && <FontAwesomeIcon icon={faCheckSquare} className='checkbox-icon' />}
      </div>
      <label htmlFor="checkbox" className='checkbox-label' onClick={onToggle}>{label}</label>
    </div>
  )
}
export default Checkbox;
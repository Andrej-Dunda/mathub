import './EllipsisMenuButton.scss'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';

interface EllipsisMenuButtonProps {
  menuOptions: string[];
  primaryColor?: string;
  secondaryColor?: string;
}

const EllipsisMenuButton: React.FC<EllipsisMenuButtonProps> = ({ menuOptions, primaryColor, secondaryColor }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const onMenuItemClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="ellipsis-menu-button" style={{ '--primary-color': primaryColor, '--secondary-color': secondaryColor } as React.CSSProperties}>
      <button
        type='button'
        onClick={toggleMenu}
        className='ellipsis-button'
        ref={buttonRef}
      >
        <FontAwesomeIcon icon={faEllipsis} color={primaryColor} width={'16px'} height={'16px'} />
      </button>
      {
        isMenuOpen && (
          <div className="popup-menu" ref={menuRef}>
            {
              menuOptions.map((option: string, index: number) => {
                return (
                  <div
                    key={index}
                    className="menu-item"
                    onClick={onMenuItemClick}
                  >
                    {option}
                  </div>
                )
              })
            }
          </div>
        )
      }
      
    </div>
  );
};

export default EllipsisMenuButton;
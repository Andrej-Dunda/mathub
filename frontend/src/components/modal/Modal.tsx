import './Modal.scss';
import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, onSubmit, children, submitContent, cancelContent }: any) => {
  const modalRef = useRef<HTMLDivElement>(null); // Refer to the modal content
  let clickStartedInside = false; // Track where the click started

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'initial'
  }, [isOpen])

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      switch (event.key) {
        case 'Enter':
          onSubmit();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    } else {
      document.removeEventListener('keydown', handleKeyPress);
    }

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onClose, onSubmit]); // Depend on the isOpen state

  const handleOverlayClick = (event: any) => {
    // Close only if clicked directly on overlay and the click didn't start inside the modal
    if (event.target.id === "overlay" && !clickStartedInside) {
      onClose();
    }
    clickStartedInside = false; // Reset the flag
  };

  const handleModalMouseDown = () => {
    // Indicate the click started inside the modal
    clickStartedInside = true;
  };
  
  return (
    <>
      {
        isOpen &&
        <div
          className='modal modal-overlay'
          id='overlay'
          onClick={handleOverlayClick}
        >
          <div
            className="modal-content"
            ref={modalRef}
            onMouseDown={handleModalMouseDown}
          >
            <div className="modal-body">
              {children}
            </div>
            <div className="modal-footer">
              <div>
                <button type='button' className='modal-button cancel-button' onClick={onClose}>{cancelContent}</button>
              </div>
              <div>
                <button type='button' className='modal-button submit-button' onClick={onSubmit}>{submitContent}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}
export default Modal;
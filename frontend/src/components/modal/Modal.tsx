import './Modal.scss'

const Modal = ({ isOpen, onClose, onSubmit, children, submitContent, cancelContent }: any) => {
  return (
    <>
      {
        isOpen &&
        <div className='modal modal-overlay'>
          <div className="modal-content">
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
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
              <button type='button' className='btn btn-primary' onClick={onSubmit}>{submitContent}</button>
              <button type='button' className='btn btn-danger' onClick={onClose}>{cancelContent}</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}
export default Modal;
import './ErrorMessage.scss'

const ErrorMessage = (props: any) => {
  return (
    <span className={`error-message ${props.content && 'active'}`}>{props.content}</span>
  )
}
export default ErrorMessage;
import './BookInput.scss'

interface iBookInput {
  label?: string;
  divClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  inputId: string;
  inputName: string;
  inputCols?: number;
  inputRows?: number;
  value: string;
  onChange: any;
  placeholder?: string;
  textarea?: boolean;
}

const BookInput = ({
  label,
  divClassName,
  labelClassName,
  inputClassName,
  inputId,
  inputName,
  inputCols = 15,
  inputRows = 5,
  value,
  onChange,
  placeholder,
  textarea = true
}: iBookInput) => {
  return (
    <div className={`book-input ${divClassName}`}>
      <label htmlFor={inputId} className={`input-label ${labelClassName}`}>{label}</label>
      {
      textarea ?
        <textarea
          className={`form-input ${inputClassName}`}
          name={inputName}
          id={inputId}
          cols={inputCols}
          rows={inputRows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        ></textarea>
        :
        <input
          className={`form-input ${inputClassName}`}
          name={inputName}
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        ></input>
      }
    </div>
  )
}
export default BookInput;
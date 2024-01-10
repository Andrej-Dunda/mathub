import { useEffect, useState } from 'react';
import './Documentation.scss'
import axios from 'axios';

const Documentation = () => {
  const [documentation, setDocumentation] = useState()

useEffect(() => {
  axios.get('/documentation')
  .then(res => {
    console.log(res)
    console.log(res.data)
    setDocumentation(res.data)
  })
}, [])

  return (
    <div>
      Documentation
      <div>
        {JSON.stringify(documentation)}
      </div>
    </div>
  )
}
export default Documentation;
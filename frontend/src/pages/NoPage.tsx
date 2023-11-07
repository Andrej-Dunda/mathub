import { useEffect } from 'react';
import './NoPage.scss'
import { useNavigate } from 'react-router-dom';

const NoPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/')
  })

  return <></>
}
export default NoPage;
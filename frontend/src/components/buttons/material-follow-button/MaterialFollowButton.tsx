import React, { useEffect, useState } from 'react'
import './MaterialFollowButton.scss'
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useNav } from '../../../contexts/NavigationProvider';
import { useAuth } from '../../../contexts/AuthProvider';
import { iSubject } from '../../../interfaces/materials-interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEye } from '@fortawesome/free-solid-svg-icons';

type MaterialFollowButtonProps = {
  subject: iSubject;
  className?: string;
}

const MaterialFollowButton = ({ subject, className }: MaterialFollowButtonProps) => {
  const { protectedHttpClientInit } = useAuth();
  const { openSnackbar } = useSnackbar();

  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  const [followsSubject, setFollowsSubject] = useState<boolean>(false);

  useEffect(() => {
    updateSubjectFollowing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const toggleSubjectFollowing = async () => {
    const httpClient = await protectedHttpClientInit();
    httpClient?.post(`/api/toggle-follow-subject/${subject._id}`)
      .then(res => {
        setFollowsSubject(res.data.followsSubject);
        openSnackbar(res.data.followsSubject ? 'Přidáno do sledovaných materiálů' : 'Odebráno ze sledovaných materiálů')
      })
      .catch(err => console.error(err));
  }

  const updateSubjectFollowing = async () => {
    const httpClient = await protectedHttpClientInit();
    httpClient?.get(`/api/follows-subject/${subject._id}`)
      .then(res => {
        setFollowsSubject(res.data.followsSubject);
      })
      .catch(err => console.error(err));
  }

  return (
    <button className={`material-follow-button ${followsSubject ? 'dark' : 'light'} ${className}`} onClick={toggleSubjectFollowing}>
      <span>{followsSubject ? "Sledujete" : "Sledovat"}</span>
      <FontAwesomeIcon icon={followsSubject ? faCheck : faEye} color={followsSubject ? grayscale100 : grayscale900} />
    </button>
  )
}

export default MaterialFollowButton

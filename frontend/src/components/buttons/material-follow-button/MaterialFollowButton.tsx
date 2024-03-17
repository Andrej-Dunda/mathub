import React, { useEffect, useState } from 'react'
import './MaterialFollowButton.scss'
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useAuth } from '../../../contexts/AuthProvider';
import { iMaterial } from '../../../interfaces/materials-interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEye } from '@fortawesome/free-solid-svg-icons';

type MaterialFollowButtonProps = {
  material: iMaterial;
  className?: string;
}

const MaterialFollowButton = ({ material, className }: MaterialFollowButtonProps) => {
  const { protectedHttpClientInit } = useAuth();
  const { openSnackbar } = useSnackbar();

  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  const [followsMaterial, setFollowsMaterial] = useState<boolean>(false);

  useEffect(() => {
    updateMaterialFollowing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const toggleMaterialFollowing = async () => {
    const httpClient = await protectedHttpClientInit();
    httpClient?.post(`/api/toggle-follow-material/${material._id}`)
      .then(res => {
        setFollowsMaterial(res.data.followsMaterial);
        openSnackbar(res.data.followsMaterial ? 'Přidáno do sledovaných materiálů' : 'Odebráno ze sledovaných materiálů')
      })
      .catch(err => console.error(err));
  }

  const updateMaterialFollowing = async () => {
    const httpClient = await protectedHttpClientInit();
    httpClient?.get(`/api/follows-material/${material._id}`)
      .then(res => {
        setFollowsMaterial(res.data.followsMaterial);
      })
      .catch(err => console.error(err));
  }

  return (
    <button className={`material-follow-button ${followsMaterial ? 'dark' : 'light'} ${className}`} onClick={toggleMaterialFollowing}>
      <span>{followsMaterial ? "Sledujete" : "Sledovat"}</span>
      <FontAwesomeIcon icon={followsMaterial ? faCheck : faEye} color={followsMaterial ? grayscale100 : grayscale900} />
    </button>
  )
}

export default MaterialFollowButton

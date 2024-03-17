import React, { useEffect, useState } from 'react'
import './MaterialFollowButton.scss'
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import { useAuth } from '../../../contexts/AuthProvider';
import { iMaterial } from '../../../interfaces/materials-interface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '../../../contexts/ModalProvider';

type MaterialFollowButtonProps = {
  material: iMaterial;
  className?: string;
  onStopFollowing?: () => void;
}

const MaterialFollowButton = ({ material, className, onStopFollowing }: MaterialFollowButtonProps) => {
  const { protectedHttpClientInit } = useAuth();
  const { openSnackbar } = useSnackbar();
  const { showModal } = useModal();

  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const grayscale100 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-100').trim();

  const [followsMaterial, setFollowsMaterial] = useState<boolean>(false);

  useEffect(() => {
    updateMaterialFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMaterialFollowing = async () => {
    const httpClient = await protectedHttpClientInit();
    httpClient?.get(`/api/follows-material/${material._id}`)
      .then(res => {
        setFollowsMaterial(res.data.followsMaterial);
      })
      .catch(err => console.error(err));
  }

  const toggleMaterialFollowing = async () => {
    if (followsMaterial) showModal(<StopFollowingMaterialModalContent />)
    else {
      const httpClient = await protectedHttpClientInit();
      httpClient?.post(`/api/toggle-follow-material/${material._id}`)
        .then(res => {
          setFollowsMaterial(res.data.followsMaterial);
          openSnackbar(res.data.followsMaterial ? 'Přidáno do sledovaných materiálů' : 'Odebráno ze sledovaných materiálů')
        })
        .catch(err => console.error(err));
    }
  }

  const StopFollowingMaterialModalContent = () => {
    const { closeModal } = useModal();
    const { openSnackbar } = useSnackbar();
    const { protectedHttpClientInit } = useAuth();

    const stopFollowingMaterial = async () => {
      const httpClient = await protectedHttpClientInit();
      httpClient?.post(`/api/toggle-follow-material/${material._id}`)
        .then(res => {
          openSnackbar('Odebráno ze sledovaných materiálů')
          updateMaterialFollowing();
          closeModal()
          onStopFollowing && onStopFollowing();
        })
        .catch(err => console.error(err));
    }

    return (
      <div className="stop-following-material-modal-content">
        <h2>Opravdu přestat sledovat materiál "{material.material_name}"?</h2>
        <div className="buttons">
          <button className='dark box-shadow' onClick={closeModal}>Zrušit</button>
          <button className='dark box-shadow' onClick={stopFollowingMaterial}>Přestat sledovat</button>
        </div>
      </div>
    )
  }

  return (
    <button className={`material-follow-button ${followsMaterial ? 'dark' : 'light'} ${className}`} onClick={toggleMaterialFollowing}>
      <span>{followsMaterial ? "Sledujete" : "Sledovat"}</span>
      <FontAwesomeIcon icon={followsMaterial ? faCheck : faEye} color={followsMaterial ? grayscale100 : grayscale900} />
    </button>
  )
}

export default MaterialFollowButton

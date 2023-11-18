import axios from 'axios';
import './FriendButton.scss';
import React, { useContext } from 'react';
import { UserContext } from '../../App';

interface iFriendButtonData {
  url: string;
  requestor_id: number;
  acceptor_id: number;
  buttonContent: string;
}

const FriendButton = (props: any) => {
  const userInfo = useContext(UserContext)
  const buttonUserId: number = props.userId
  const acceptFriendRequest: iFriendButtonData = {
    url: '/accept-friend-request',
    requestor_id: buttonUserId,
    acceptor_id: userInfo.id,
    buttonContent: 'Potvrdit'
  }
  const removeFriendRequest: iFriendButtonData = {
    url: '/remove-friend-request',
    requestor_id: buttonUserId,
    acceptor_id: userInfo.id,
    buttonContent: 'Zrušit žádost'
  }
  const removeMyFriendRequest: iFriendButtonData = {
    url: '/remove-friend-request',
    requestor_id: userInfo.id,
    acceptor_id: buttonUserId,
    buttonContent: 'Odebrat'
  }
  const addFriendRequest: iFriendButtonData = {
    url: '/add-friend-request',
    requestor_id: userInfo.id,
    acceptor_id: buttonUserId,
    buttonContent: 'Přidat přítele'
  } 
  const removeFriendSuggestion: iFriendButtonData = {
    url: '/remove-friend-suggestion',
    requestor_id: userInfo.id,
    acceptor_id: buttonUserId,
    buttonContent: 'Odebrat'
  }
  const removeFriend: iFriendButtonData = {
    url: '/remove-friend',
    requestor_id: userInfo.id,
    acceptor_id: buttonUserId,
    buttonContent: 'Odebrat přítele'
  }
  const buttonData: iFriendButtonData | null = props.buttonType === 'remove-suggestion' ? removeFriendSuggestion
    : props.buttonType === 'remove-request' ? removeFriendRequest
    : props.buttonType === 'accept' ? acceptFriendRequest
    : props.buttonType === 'request' ? addFriendRequest
    : props.buttonType === 'remove-friend' ? removeFriend
    : props.buttonType === 'remove-my-request' ? removeMyFriendRequest
    : null

  const handleClick = () => {
    buttonData && axios({
      method: "POST",
      url: buttonData.url,
      data: {
        requestor_id: buttonData.requestor_id,
        acceptor_id: buttonData.acceptor_id
      }
    })
      .then((response: any) => {
        console.log(response.data.msg)
        window.location.reload()
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  return (
    <>
    {buttonData && <button className={`friend-button ${props.buttonType}`} onClick={handleClick}>
      {buttonData.buttonContent}
    </button>}
    </>
  )
}
export default FriendButton;
import './FriendButton.scss';
import { useUserData } from '../../../contexts/UserDataProvider';
import httpClient from '../../../utils/httpClient';

interface iFriendButtonData {
  url: string;
  requestor_id: string;
  acceptor_id: string;
  buttonContent: string;
}

const FriendButton = (props: any) => {
  const { user } = useUserData();
  const buttonUserId: string = props.userId
  const acceptFriendRequest: iFriendButtonData = {
    url: '/accept-friend-request',
    requestor_id: buttonUserId,
    acceptor_id: user._id,
    buttonContent: 'Potvrdit'
  }
  const removeFriendRequest: iFriendButtonData = {
    url: '/remove-friend-request',
    requestor_id: buttonUserId,
    acceptor_id: user._id,
    buttonContent: 'Zrušit žádost'
  }
  const removeMyFriendRequest: iFriendButtonData = {
    url: '/remove-friend-request',
    requestor_id: user._id,
    acceptor_id: buttonUserId,
    buttonContent: 'Odebrat'
  }
  const addFriendRequest: iFriendButtonData = {
    url: '/add-friend-request',
    requestor_id: user._id,
    acceptor_id: buttonUserId,
    buttonContent: 'Přidat přítele'
  } 
  const removeFriendSuggestion: iFriendButtonData = {
    url: '/remove-friend-suggestion',
    requestor_id: user._id,
    acceptor_id: buttonUserId,
    buttonContent: 'Odebrat'
  }
  const removeFriend: iFriendButtonData = {
    url: '/remove-friend',
    requestor_id: user._id,
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
    buttonData && httpClient.post(buttonData.url, {
        requestor_id: buttonData.requestor_id,
        acceptor_id: buttonData.acceptor_id
      })
      .then(() => {
        props.updateFriends()
      }).catch((error: any) => {
        if (error.response) {
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
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
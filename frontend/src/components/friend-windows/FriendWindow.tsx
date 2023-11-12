import React from "react";
import './FriendWindow.scss'
import FriendButton from "./FriendButton";
import Logo from "../../images/Logo";

const userInfoDummy = {
  id: '3',
  first_name: 'John',
  last_name: 'Doe',
  profile_picture: 'image.jpg'
}

const FriendWindow = (props: any) => {
  const [id, first_name, last_name] = props.userData

  const windowTypeData = props.type === 'friend-request' ? {
    firstButtonType: 'accept',
    secondButtonType: 'remove-request'

  } : props.type === 'friend-suggestion' ? {
    firstButtonType: 'request',
    secondButtonType: 'remove-suggestion'
  } : {
    firstButtonType: 'remove-friend',
    secondButtonType: undefined
  }

  return (
    <div className="friend-window">
      <Logo className='profile-picture' />
      <h4 className="h4 friend-name">
        {`${first_name} ${last_name}`}
      </h4>
      <div className="buttons">
        <FriendButton buttonType={windowTypeData?.firstButtonType} />
        <FriendButton buttonType={windowTypeData?.secondButtonType} />
      </div>
      
    </div>
  )
}
export default FriendWindow;
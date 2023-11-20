import React from "react";
import './FriendWindow.scss'
import FriendButton from "../friend-button/FriendButton";
import ProfilePicture from "../profile-picture/ProfilePicture";

const FriendWindow = (props: any) => {
  const [id, first_name, last_name] = props.userData

  const windowTypeData = props.type === 'friend-request' ? {
    firstButtonType: 'accept',
    secondButtonType: 'remove-request'
  } : props.type === 'my-friend-request' ? {
    firstButtonType: 'remove-my-request',
    secondButtonType: undefined
  } : props.type === 'friend-suggestion' ? {
    firstButtonType: 'request',
    secondButtonType: 'remove-suggestion'
  } : {
    firstButtonType: 'remove-friend',
    secondButtonType: undefined
  }

  return (
    <div className="friend-window">
      <ProfilePicture className='medium' userId={id} />
      <h4 className="h4 friend-name">
        {`${first_name} ${last_name}`}
      </h4>
      <div className="buttons">
        <FriendButton buttonType={windowTypeData?.firstButtonType} userId={id} updateFriends={props.updateFriends} />
        <FriendButton buttonType={windowTypeData?.secondButtonType} userId={id} updateFriends={props.updateFriends} />
      </div>
      
    </div>
  )
}
export default FriendWindow;
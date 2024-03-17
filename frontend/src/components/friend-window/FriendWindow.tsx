import React from "react";
import './FriendWindow.scss'
import FriendButton from "../buttons/friend-button/FriendButton";
import ProfilePicture from "../profile-picture/ProfilePicture";
import { useUserData } from "../../contexts/UserDataProvider";
import { useNav } from "../../contexts/NavigationProvider";

const FriendWindow = (props: any) => {
  const { user } = useUserData();
  const { toUserProfile, toMyProfile } = useNav();
  const {_id, first_name, last_name} = props.userData

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

  const redirectToUserProfile = () => {
    if (_id === user._id) toMyProfile()
    else toUserProfile(_id)
  }

  return (
    <div className={`friend-window ${props.className}`}>
      <ProfilePicture className='friend-window-profile-picture' userId={_id} />
      <h4 className="h4 friend-name" title={`${first_name} ${last_name}`} onClick={redirectToUserProfile}>
        {`${first_name} ${last_name}`}
      </h4>
      <div className="buttons">
        <FriendButton buttonType={windowTypeData?.firstButtonType} userId={_id} updateFriends={props.updateFriends} />
        <FriendButton buttonType={windowTypeData?.secondButtonType} userId={_id} updateFriends={props.updateFriends} />
      </div>
      
    </div>
  )
}
export default FriendWindow;
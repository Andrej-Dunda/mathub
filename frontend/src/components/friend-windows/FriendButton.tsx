import './FriendButton.scss';
import React from 'react';

const FriendButton = (props: any) => {
  const buttonContent = props.buttonType === 'remove-suggestion' || props.buttonType === 'remove-request' ? 'Odebrat'
  : props.buttonType === 'accept' ? 'Potvrdit'
      : props.buttonType === 'request' ? 'Přidat přítele'
        : props.buttonType === 'remove-friend' ? 'Odebrat přítele'
          : null

  const handleClick = () => {
    console.log('handled click')
  }

  return (
    <>
    {buttonContent && <button className={`friend-button ${props.buttonType}`} onClick={handleClick}>
      {buttonContent}
    </button>}
    </>
  )
}
export default FriendButton;
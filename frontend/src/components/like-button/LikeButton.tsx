import './LikeButton.scss'
import Heart from '../../images/Heart'
import { useState } from 'react'

const LikeButton = (props: any) => {
  const [liked, setLiked] = useState<boolean>(false)
  const onLikeButtonClick = () => {
    // props.onClick();
    setLiked(!liked)
  }

  return (
    <div className="like-button" onClick={onLikeButtonClick}>
      <Heart fill='	#6f1200' />
    </div>
  )
}
export default LikeButton;
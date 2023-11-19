import './ProfilePicture.scss'

const ProfilePicture = (props: any) => {
  return (
    <img
      className={`profile-picture ${props.className}`}
      src={`http://127.0.0.1:5000/profile-picture/${props.userId}`}
      alt=""
    />
  )
}
export default ProfilePicture;
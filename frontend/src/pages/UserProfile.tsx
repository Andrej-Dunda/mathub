import './UserProfile.scss'
import { useContext } from 'react'
import { UserContext } from '../App';

const UserProfile = () => {
  const userInfo = useContext(UserContext)

  return (
    <div className="user-profile">
      <h1 className='h3'>
        Profil uživatele
      </h1>
      <table className='table table-striped'>
        <tbody>
          <tr>
            <td>ID: </td>
            <td>{userInfo ? userInfo.id : 'NaN'}</td>
          </tr>
          <tr>
            <td>E-mail: </td>
            <td>{userInfo ? userInfo.email : 'NaN'}</td>
          </tr>
          <tr>
            <td>Heslo: </td>
            <td>{userInfo ? userInfo.password : 'NaN'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default UserProfile;
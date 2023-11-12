import { useEffect, useState } from 'react';
import './Friends.scss'
import React from 'react';
import FriendWindow from '../components/friend-windows/FriendWindow';

const Friends = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const toggleShowAllUsers = () => {
    setShowAllUsers(!showAllUsers)
  }

  useEffect(() => {
    fetch("/users")
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((userData) => {
        setUsers(userData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [])

  return (
    <div className="friends">
      <div className="container friends-sections">
        <div className="friend-requests">
          <h3 className='h3'>Žádosti o přátelství</h3>
          <div className="friend-requests-windows">
            <FriendWindow type='friend-request' />
          </div>
        </div>
        <hr />
        <div className="friend-suggestions">
          <h3 className='h3'>Lidé, které možná znáte</h3>
          <FriendWindow type='friend-suggestion' />
        </div>
        <hr />
        <div className="friends">
          <h3 className='h3'>Vaši přátelé</h3>
          <FriendWindow type='friend' />
        </div>
      </div>
      







      <div className="container-fluid users-list">
        <label className='show-all-users' htmlFor="show-all-users">
          <input type="checkbox" name='show-all-users' id='show-all-users' checked={showAllUsers} onChange={toggleShowAllUsers} />
          <span className='form-text'>Zobrazit seznam všech uživatelů</span>
        </label>
        {showAllUsers && <table className='table table-striped'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Heslo</th>
              <th>Jméno</th>
              <th>Příjmení</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userData: any[], index: number) => {
              return (
                <tr key={index}>
                  <td>{userData[0]}</td>
                  <td>{userData[1]}</td>
                  <td>{userData[3]}</td>
                  <td>{userData[3]}</td>
                  <td>{userData[4]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        }
      </div>
      
    </div>
  )
}
export default Friends;
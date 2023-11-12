import { useEffect, useState } from 'react';
import './Friends.scss'
import React from 'react';

const Friends = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');

  useEffect(() => {
    fetch("/users")
      .then((res) => {
        if(!res.ok) throw new Error('Network response was not ok');
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
    <div className="users">
      <table className='table table-striped'>
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
                <td>{userData[2]}</td>
                <td>{userData[3]}</td>
                <td>{userData[4]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default Friends;
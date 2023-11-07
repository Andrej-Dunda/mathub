import { useEffect, useState } from 'react';
import './Users.scss'

const Users = () => {
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

  const handleNewUserSubmit = (e: any) => {
    e.preventDefault();
    fetch('/register-new-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([newUserName, newPassword]),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Handle the response from Flask
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="users">
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Name</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {users.map((userData: any[], index: number) => {
            return (
              <tr key={index}>
                <td>{userData[0]}</td>
                <td>{userData[1]}</td>
                <td>{userData[2]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="add-user">
        <form onSubmit={handleNewUserSubmit}>
          <div>
            <label htmlFor="newUserName">New user name: </label>
            <input id='newUserName' type="email" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)}/>
          </div>
          <div>
            <label htmlFor="newPassword">New password</label>
            <input id='newPassword' type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
          </div>
          <button type='submit'>Add user</button>
        </form>
      </div>
    </div>
  )
}
export default Users;
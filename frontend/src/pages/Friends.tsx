import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../App';
import './Friends.scss'
import React from 'react';
import FriendWindow from '../components/friend-windows/FriendWindow';
import axios from 'axios';

const Friends = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [myFriendRequests, setMyFriendRequests] = useState<any[]>([])
  const [friendSuggestions, setFriendSuggestions] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [showAllUsers, setShowAllUsers] = useState(false);
  const userInfo = useContext(UserContext)

  const toggleShowAllUsers = () => {
    setShowAllUsers(!showAllUsers)
  }

  useEffect(() => {
    getAllUsers()
    getFriendSuggestions()
    getFriendRequests()
    getMyFriendRequests()
    getFriends()
  }, [])

  const getFriends = () => {
    axios({
      method: "POST",
      url: "/get-friends",
      data: {
        user_id: userInfo.id
      }
    })
      .then((response: any) => {
        setFriends(response.data)
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  const getFriendRequests = () => {
    axios({
      method: "POST",
      url: "/get-friend-requests",
      data: {
        user_id: userInfo.id
      }
    })
      .then((response: any) => {
        setFriendRequests(response.data)
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  const getMyFriendRequests = () => {
    axios({
      method: "POST",
      url: "/get-my-friend-requests",
      data: {
        user_id: userInfo.id
      }
    })
      .then((response: any) => {
        setMyFriendRequests(response.data)
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  const getAllUsers = () => {
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
  }

  const getFriendSuggestions = () => {
    axios({
      method: "POST",
      url: "/get-friend-suggestions",
      data: {
        user_id: userInfo.id
      }
    })
      .then((response: any) => {
        setFriendSuggestions(response.data)
      }).catch((error: any) => {
        if (error.response) {
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })
  }

  return (
    <div className="friends">
      <div className="container friends-sections">
        {friendRequests.length !== 0 ?
          <>
            <div className="friend-requests">
              <h3 className='h3'>Žádosti o přátelství</h3>
              <div className="friend-requests-windows">
                {
                  friendRequests.map((user, index) => {
                    return <FriendWindow key={index} userData={user} type='friend-request' />
                  })
                }
              </div>
            </div>
            <hr />
          </> : null}
        {myFriendRequests.length !== 0 && (
          <>
            <div className="my-friend-requests">
              <h3 className='h3'>Moje žádosti o přátelství</h3>
              <div className="my-friend-requests-windows">
                {
                  myFriendRequests.map((user, index) => {
                    return <FriendWindow key={index} userData={user} type='my-friend-request' />
                  })
                }
              </div>
            </div>
            <hr />
          </>
        )}
        <div className="friend-suggestions">
          <h3 className='h3'>Lidé, které možná znáte</h3>
          {friendSuggestions.length !== 0 ? <div className="friend-suggestions-windows">
            {
              friendSuggestions.map((user, index) => {
                return <FriendWindow key={index} userData={user} type='friend-suggestion' />
              })
            }
          </div> : <span>Nemáte žádná doporučení</span>}
        </div>
        <hr />
        <div className="friends">
          <h3 className='h3'>Vaši přátelé</h3>
          {friends?.length !== 0 ? <div className="friends-windows">
            {
              friends.map((user, index) => {
                return <FriendWindow key={index} userData={user} type='friend' />
              })
            }
          </div> : <span>Nemáte žádné přátele :(</span>}
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
                  <td>{userData[2]}</td>
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
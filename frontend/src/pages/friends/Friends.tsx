/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import './Friends.scss'
import React from 'react';
import FriendWindow from '../../components/friend-window/FriendWindow';
import axios from 'axios';
import Checkbox from '../../components/checkbox/Checkbox';

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
    updateFriends()
  }, [])

  const updateFriends = () => {
    getFriendSuggestions()
    getFriendRequests()
    getMyFriendRequests()
    getFriends()
  }

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
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
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
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
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
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
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
          console.error(error.response)
          console.error(error.response.status)
          console.error(error.response.headers)
        }
      })
  }

  return (
    <div className="friends">
      {friendRequests.length !== 0 ?
        <>
          <div className="friend-requests friends-section">
            <h3 className='h3'>Žádosti o přátelství</h3>
            <div className="friend-requests-windows friends-windows">
              {
                friendRequests.map((user, index) => {
                  return <FriendWindow className='friend-window' key={index} userData={user} type='friend-request' updateFriends={updateFriends} />
                })
              }
            </div>
          </div>
          <hr />
        </> : null}
      {myFriendRequests.length !== 0 && (
        <>
          <div className="my-friend-requests friends-section">
            <h3 className='h3'>Moje žádosti o přátelství</h3>
            <div className="my-friend-requests-windows friends-windows">
              {
                myFriendRequests.map((user, index) => {
                  return <FriendWindow className='friend-window' key={index} userData={user} type='my-friend-request' updateFriends={updateFriends} />
                })
              }
            </div>
          </div>
          <hr />
        </>
      )}
      <div className="friend-suggestions friends-section">
        <h3 className='h3'>Lidé, které možná znáte</h3>
        {friendSuggestions.length !== 0 ? <div className="friend-suggestions-windows friends-windows">
          {
            friendSuggestions.map((user, index) => {
              return <FriendWindow className='friend-window' key={index} userData={user} type='friend-suggestion' updateFriends={updateFriends} />
            })
          }
        </div> : <span>Nemáte žádná doporučení</span>}
      </div>
      <hr />
      <div className="my-friends friends-section">
        <h3 className='h3'>Vaši přátelé</h3>
        {friends?.length !== 0 ? <div className="my-friends-windows friends-windows">
          {
            friends.map((user, index) => {
              return <FriendWindow className='friend-window' key={index} userData={user} type='friend' updateFriends={updateFriends} />
            })
          }
        </div> : <span>Nemáte žádné přátele :(</span>}
      </div>
    </div>
  )
}
export default Friends;
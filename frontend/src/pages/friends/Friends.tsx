import { useEffect, useState } from 'react';
import './Friends.scss'
import FriendWindow from '../../components/friend-window/FriendWindow';
import { useUserData } from '../../contexts/UserDataProvider';
import { useNav } from '../../contexts/NavigationProvider';
import httpClient from '../../utils/httpClient';

const Friends = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [myFriendRequests, setMyFriendRequests] = useState<any[]>([])
  const [friendSuggestions, setFriendSuggestions] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const { user } = useUserData();
  const { setActiveLink } = useNav();

  useEffect(() => {
    setActiveLink('friends')
    updateFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateFriends = () => {
    getFriendSuggestions()
    getFriendRequests()
    getMyFriendRequests()
    getFriends()
  }

  const getFriends = () => {
    httpClient.post("/get-friends", {
      user_id: user._id
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
    httpClient.post("/get-friend-requests", {
      user_id: user._id
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
    httpClient.post("/get-my-friend-requests", {
      user_id: user._id
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

  const getFriendSuggestions = () => {
    httpClient.post("/get-friend-suggestions", {
      user_id: user._id
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
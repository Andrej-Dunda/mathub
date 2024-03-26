import { useEffect, useState } from 'react';
import './Friends.scss'
import FriendWindow from '../../components/friend-window/FriendWindow';
import { useUserData } from '../../contexts/UserDataProvider';
import { useNav } from '../../contexts/NavigationProvider';
import { useAuth } from '../../contexts/AuthProvider';

const Friends = () => {
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [friendRequestsShowCount, setFriendRequestsShowCount] = useState<number>(5)

  const [myFriendRequests, setMyFriendRequests] = useState<any[]>([])
  const [myFriendRequestsShowCount, setMyFriendRequestsShowCount] = useState<number>(5)

  const [friendSuggestions, setFriendSuggestions] = useState<any[]>([])
  const [friendSuggestionsShowCount, setFriendSuggestionsShowCount] = useState<number>(5)

  const [friends, setFriends] = useState<any[]>([])
  const [friendsShowCount, setFriendsShowCount] = useState<number>(5)

  const { user } = useUserData();
  const { setActiveLink } = useNav();
  const { protectedHttpClientInit } = useAuth();

  useEffect(() => {
    setActiveLink('/friends')
    updateFriends()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id])

  const updateFriends = () => {
    getFriendSuggestions()
    getFriendRequests()
    getMyFriendRequests()
    getFriends()
  }

  const getFriends = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post("/api/get-friends", {
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

  const getFriendRequests = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post("/api/get-friend-requests", {
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

  const getMyFriendRequests = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post("/api/get-my-friend-requests", {
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

  const getFriendSuggestions = async () => {
    const protectedHttpClient = await protectedHttpClientInit();
    protectedHttpClient?.post("/api/get-friend-suggestions", {
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
                friendRequests.slice(0, friendRequestsShowCount).map((user, index) => {
                  return <FriendWindow className='friend-window' key={index} userData={user} type='friend-request' updateFriends={updateFriends} />
                })
              }
            </div>
            {friendRequests.length > friendRequestsShowCount && <button className='show-more-button' onClick={() => setFriendRequestsShowCount(friendRequestsShowCount + 5)}>Zobrazit více</button>}
          </div>
          <hr />
        </> : null}
      {myFriendRequests.length !== 0 && (
        <>
          <div className="my-friend-requests friends-section">
            <h3 className='h3'>Moje žádosti o přátelství</h3>
            <div className="my-friend-requests-windows friends-windows">
              {
                myFriendRequests.slice(0, myFriendRequestsShowCount).map((user, index) => {
                  return <FriendWindow className='friend-window' key={index} userData={user} type='my-friend-request' updateFriends={updateFriends} />
                })
              }
            </div>
            {myFriendRequests.length > myFriendRequestsShowCount && <button className='show-more-button' onClick={() => setMyFriendRequestsShowCount(myFriendRequestsShowCount + 5)}>Zobrazit více</button>}
          </div>
          <hr />
        </>
      )}
      <div className="friend-suggestions friends-section">
        <h3 className='h3'>Lidé, které možná znáte</h3>
        {friendSuggestions.length !== 0 ? <div className="friend-suggestions-windows friends-windows">
          {
            friendSuggestions.slice(0, friendSuggestionsShowCount).map((user, index) => {
              return <FriendWindow className='friend-window' key={index} userData={user} type='friend-suggestion' updateFriends={updateFriends} />
            })
          }
        </div> : <span>Nemáte žádná doporučení</span>}
        {friendSuggestions.length > friendSuggestionsShowCount && <button className='show-more-button' onClick={() => setFriendSuggestionsShowCount(friendSuggestionsShowCount + 5)}>Zobrazit více</button>}
      </div>
      <hr />
      <div className="my-friends friends-section">
        <h3 className='h3'>Vaši přátelé</h3>
        {friends?.length !== 0 ? <div className="my-friends-windows friends-windows">
          {
            friends.slice(0, friendsShowCount).map((user, index) => {
              return <FriendWindow className='friend-window' key={index} userData={user} type='friend' updateFriends={updateFriends} />
            })
          }
        </div> : <span>Nemáte žádné přátele :(</span>}
        {friends.length > friendsShowCount && <button className='show-more-button' onClick={() => setFriendsShowCount(friendsShowCount + 5)}>Zobrazit více</button>}
      </div>
    </div>
  )
}
export default Friends;
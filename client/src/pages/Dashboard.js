import {useEffect, useState} from "react";
import TinderCard from "react-tinder-card";
import { useCookies }from 'react-cookie'
import ChatContainer from '../components/ChatContainer'
import axios from "axios";


const Dashboard = () => {

    const [user, setUser] = useState(null)
    const [ genderedUsers, setGenderedUsers ] = useState(null)
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const [lastDirection, setLastDirection] = useState()

    const userId = cookies.UserId
    const getUser =  async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: { userId }
            })
            setUser(response.data)
        } catch(err) {
            console.log(err)
        }
    }

    const getGenderedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/gendered-users', {
                params: { gender: user?.gender_interest}
            })
            setGenderedUsers(response.data)
            console.log(genderedUsers)
        } catch (err){
            console.log(err)
        }
    }

    useEffect(() => {
        getUser()
        getGenderedUsers()
    }, []);


    const updatedMatches = async (matchedUserId) => {
        try {
            await axios.put('http://localhost:8000/addmatch', {
                userId, matchedUserId
            })
            getUser()
        } catch (err)
        {
            console.log(err)
        }
    }

    const matchedUserIds =user?.matches.map(({ user_id }) => user_id).concat(userId)

    const filteredGenderedUsers =
        genderedUsers?.filter((genderedUser) => !matchedUserIds?.includes(genderedUser.user_id))
    const swiped = (direction, swipedUserId) => {
        if (direction === 'right'){
            updatedMatches(swipedUserId)
        }
        setLastDirection(direction)
    }

    console.log(filteredGenderedUsers)

    const outOfFrame = (name) => {
        console.log(name + ' left the screen!')
    }

    return(
        <>
            { user &&
        <div className="dashboard">
            <ChatContainer user={user}/>
            <div className="swipe-container">
                <div className="card-container">

                    {filteredGenderedUsers?.map((character) =>
                        <TinderCard
                            className='swipe'
                            key={character.user_id}
                            onSwipe={(dir) => swiped(dir, character.user_id)}
                            onCardLeftScreen={() => outOfFrame(character.user_id)}>
                            <div style={{ backgroundImage: 'url(' + character.url + ')' }}
                                 className='card'>
                                <h3>{character.name}</h3>
                            </div>
                        </TinderCard>
                    )}
                    <div className="swipe-info">
                        { lastDirection ? <p>You swiped {lastDirection}</p> : <p/> }
                    </div>
                </div>
            </div>
        </div>
            }
    </>)
}

export default Dashboard
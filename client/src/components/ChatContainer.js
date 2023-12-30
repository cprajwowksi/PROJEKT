import ChatHeader from './ChatHeader'
import MatchesDisplay from './MatchesDisplay'
import ChatDisplay from './ChatDisplay'
import { useState } from 'react'

const ChatContainer = ({ user }) => {
    const [ clickedUser, setClickedUser ] = useState(null)

    return (
        <div className="chat-container">
            <ChatHeader user={user}/>

            <div className="w-full flex justify-center">
                <button className="option w-1/3" onClick={() => setClickedUser(null)}>Matches</button>
                <button className="option w-1/3" disabled={!clickedUser}>Chat</button>
            </div>

            {!clickedUser && <MatchesDisplay matches={user.matches} setClickedUser={setClickedUser}/>}

            {clickedUser && <ChatDisplay user={user} clickedUser={clickedUser}/>}
        </div>
    )
}

export default ChatContainer
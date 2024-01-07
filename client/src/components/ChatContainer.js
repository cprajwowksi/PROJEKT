import ChatHeader from './ChatHeader'
import MatchesDisplay from './MatchesDisplay'
import ChatDisplay from './ChatDisplay'
import {useState} from 'react'
import { useChatContext } from './ChatProvider';

const ChatContainer = () => {
    const [ clickedUser, setClickedUser ] = useState(null)

    const { user } = useChatContext();


    return (
        <div className="chat-container">
            <ChatHeader/>

            <div className="w-full flex justify-center">
                <button className="option w-1/3" onClick={() => setClickedUser(null)}>Matches</button>
                <button className="option w-1/3" disabled={!clickedUser}>Chat</button>
            </div>

            {!clickedUser && <MatchesDisplay matches={user.matches} setClickedUser={setClickedUser}/>}

            {clickedUser && <ChatDisplay clickedUser={clickedUser}/>}
        </div>
    )
}

export default ChatContainer
import { useState } from "react";
import axios from 'axios'
import { useChatContext } from './ChatProvider';

const  ChatInput= ({ clickedUser, getUsersMessages, getClickedUsersMessages}) => {
    const { user } = useChatContext();
    const [textArea, setTextArea] = useState("")
    const userId = user?.user_id
    const clickedUserId = clickedUser?.user_id

    const addMessage = async () => {
        const message = {
            timestamp: new Date().toISOString(),
            from_userId: userId,
            to_userId: clickedUserId,
            message: textArea
        }

        try {
            await axios.post('http://localhost:8000/messages', {message})
            getClickedUsersMessages()
            getUsersMessages()
        } catch (error) {
            console.log(error)
        }
    }

    return (<>
            <div className="chat-input">
                <textarea onChange={(e) => setTextArea(e.target.value)}/>
                <button className="secondary-button" onClick={addMessage}>Submit</button>
            </div>
        </>

    )
}

export default ChatInput
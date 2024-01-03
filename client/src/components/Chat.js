import {useReducer, useRef, useEffect} from "react";
import { useCookies } from 'react-cookie'


const Chat = ({descendingOrderMessages}) => {
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const prevSenderRef = useRef(false);
    prevSenderRef.current = false
    const userekId = cookies.UserId

    return (
        <>
            <div className="chat-display">
                {
                    descendingOrderMessages.map((message, _index) => {
                        prevSenderRef.prev = prevSenderRef.current
                        prevSenderRef.current = message.userId
                    return (
                    <div key={_index} className={message.userId === userekId ? "flex flex-col items-end gap-0" : ""}>
                        {prevSenderRef.prev === message.userId ? <div></div> : <div className="chat-message-header">
                            <div className="img-container" >
                                <img src={message.img} alt={message.name + ' profile'}/>
                            </div>
                            <p className="m-4 font-bold">{message.name}</p>
                        </div>}
                        <p>{message.message}</p>
                    </div>
                )
                }
                )}
            </div>
        </>
    )
}

export default Chat
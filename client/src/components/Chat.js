import {useReducer, useRef, useEffect, useState} from "react";
import { useCookies } from 'react-cookie'
import axios from "axios";


const Chat = ({descendingOrderMessages}) => {
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const [ edited, setEdited] = useState("")
    const prevSenderRef = useRef(false);
    prevSenderRef.current = false

    const userekId = cookies.UserId

    const deleteMessage = async (message) => {
        try {
            const response = await axios.delete('http://localhost:8000/message', {
                params: { messageId: message.id }
            });
            return response
        } catch (err) {
            console.log(err);
        }
    };

    const editMessage = async (message, edited) => {
        try {
            await axios.patch('http://localhost:8000/message', {
                params: { messageId: message.id, editedMessage: edited }
            });

        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setEdited(e.target.value)
    }
    const reducer = (state, action) => {
        switch (action.type) {
            case 'DELETE_CLICKED':
                deleteMessage(action.payload)
                return { ...state, messages: state.messages.filter(x => x !== action.payload) }
            case 'EDIT_CLICKED':
                return {
                    ...state, editClicked: !state.editClicked, message: action.payload }
            case 'SUBMIT_EDITION':
                editMessage(state.message, edited)
                return {
                    ...state,
                    editClicked: !state.editClicked,
                    message: "",
                    messages: state.messages.map(x => x === state.message ? { ...state.message, message: edited } : x) }
            case 'SET_MESSAGES':
                return { ...state, messages: action.payload, message: "" }
            default:
                return state;
        }
    }


    const [state, dispatch] = useReducer(reducer, { messages: [], message: "", editClicked: false })

    useEffect(() => {
        if (descendingOrderMessages && descendingOrderMessages.length > 0) {
            dispatch({ type: 'SET_MESSAGES', payload: descendingOrderMessages });
        }
    }, [descendingOrderMessages]);



    return (
        <>
            <div className="chat-display">
                {
                    state.messages.map((message, _index) => {
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
                        {message.userId === userekId ?
                            <p className="hoverable">
                                {
                                    state.editClicked ?
                                        <>
                                            <input type="text" onChange={handleChange}/>
                                            <i className="fa fa-check m-2 hover:cursor-pointer text-gray-500"
                                               aria-hidden="true"
                                               onClick={() => dispatch({ type:'SUBMIT_EDITION', payload: edited})}
                                            ></i>
                                        </> : null }

                                <i className="fa fa-trash-o m-2 hover:cursor-pointer text-gray-500"
                                       onClick={() => dispatch({ type: 'DELETE_CLICKED', payload: message })}>
                                    </i>
                                    <i className="fa fa-pencil m-2 hover:cursor-pointer text-gray-500"
                                       onClick={() => dispatch({ type: 'EDIT_CLICKED', payload: message  })}>
                                    </i>
                                    {message.message}
                            </p>
                            :
                            <p className="hoverable">
                                    {message.message}

                                <i className="fa fa-trash-o m-2 hover:cursor-pointer text-gray-500"
                                   onClick={() => dispatch({ type: 'DELETE_CLICKED', payload: message })}
                                >
                                </i>
                                <i className="fa fa-pencil m-2 hover:cursor-pointer text-gray-500"
                                   onClick={() => dispatch({ type: 'EDIT_CLICKED', payload: message  })}
                                >
                                </i>
                            </p>
                        }

                    </div>
                )
                }
                )}
            </div>

        </>
    )
}

export default Chat
import {useCookies} from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useChatContext } from './ChatProvider';

const  ChatHeader= () => {
    const [cookies, setCookie, removeCookie ] = useCookies(['user'])

    const { user } = useChatContext();

    let navigate = useNavigate()

    const logout = () => {
        removeCookie('UserId', cookies.UserId)
        removeCookie('AuthToken', cookies.AuthToken)
        navigate('/')
        window.location.reload()
    }
    return (
        <div className="chat-container-header">
            <div className="profile">
                <div className="img-container">
                    <img src={user.url} alt={`photo of ${user.first_name}`}/>
                </div>
                <h3>{user.first_name}</h3>
                <button className="primary-button" onClick={() => navigate('/profile')}>Edit Profile</button>
            </div>

            <button className="secondary-button hover:cursor-pointer"  onClick={logout}>Logout</button>
        </div>
    )
}

export default ChatHeader
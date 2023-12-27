import Nav from '../components/Nav'
import { useState } from 'react'
import AuthModal from "../components/AuthModal";
import {useCookies} from "react-cookie";

const Home = () => {

    const [showModal, setShowModal] = useState(false)

    const [isSignUp, setIsSignUp] = useState(true)

    const [ cookies, setCookie, removeCookie] = useCookies(['user'])

    const authToken = cookies.authToken
    const handleClick = () => {
        console.log('clicked')
        setShowModal(true)
        setIsSignUp(true)
        if (authToken) {
            removeCookie('UserId', cookies.UserId)
            removeCookie('AuthToken', cookies.AuthToken)
            window.location.reload()
            return
        }
    }

    return (
        <>
            <div className="overlay">
                <Nav
                    authToken={{authToken}}
                    minimal={false}
                    setShowModal={setShowModal}
                    showModal={showModal}
                    setIsSignUp={setIsSignUp}
                />
                <div className="home">

                    <h1 className="primary-title"> Swipe Right</h1>
                    <button className="primary-button" onClick={handleClick}>
                    {authToken ? 'Signed in' : "Create account"}
                    </button>

                    {showModal && (
                        <AuthModal
                            setShowModal={setShowModal}
                            setIsSignUp={setIsSignUp}
                            isSignUp={isSignUp}
                        />
                    )}

                </div>
            </div>
        </>
    )
}

export default Home
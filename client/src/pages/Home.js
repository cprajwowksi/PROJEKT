import Nav from '../components/Nav'
import {useEffect, useState} from 'react'
import AuthModal from "../components/AuthModal";
import {useCookies} from "react-cookie";
import axios from "axios";
const Home = () => {

    const [showModal, setShowModal] = useState(false)
    const [ count, setCount ] = useState(null)
    const [isSignUp, setIsSignUp] = useState(true)

    const [ cookies, setCookie, removeCookie] = useCookies(['user'])

    const authToken = cookies.authToken

    const getCount =  async () => {
        try {
            const response = await axios.get('http://localhost:8000/count')
            setCount(response.data.count)
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getCount()
    }, []);
    const handleClick = () => {
        console.log('clicked')
        setShowModal(true)
        setIsSignUp(true)
        if (authToken) {
            removeCookie('UserId', cookies.UserId)
            removeCookie('AuthToken', cookies.AuthToken)
            window.location.reload()

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
                <h2 className="counter text-5xl text-white">Zarejestrowanych {count} potencjalnych partnerów!</h2>
            </div>

        </>
    )
}

export default Home
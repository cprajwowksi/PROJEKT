import whiteLogo from '../images/bialelogo.png'
import colorLogo from '../images/kolorowelogo.png'

const Nav = ({authToken, minimal, setShowModal, showModal, setIsSignUp}) => {

    const handleClick = () => {
        setShowModal(true)
        setIsSignUp(false)
    }

    console.log(authToken, minimal)

    return (
        <nav>
            <div className="logo-container">
                <img className="logo" src={minimal ? colorLogo : whiteLogo}/>
            </div>
            {!minimal && <button
                className="nav-button"
                onClick={handleClick}
                disabled={showModal}
            >Log in</button>}
        </nav>
    )
}

export default Nav
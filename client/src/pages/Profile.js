import { useState } from 'react'
import {useCookies} from "react-cookie";

const Profile = () => {

    const [ cookies, setCookie, removeCookie] = useCookies(['user'])

    const authToken = cookies.authToken

    return (
        <>
            <div className="profile">

            </div>
        </>
    )
}

export default Profile
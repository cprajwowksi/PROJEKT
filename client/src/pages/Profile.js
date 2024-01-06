import { useState, useReducer, useEffect} from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {useCookies} from "react-cookie";
import ProfileChange from "../components/ProfileChange";

const Profile = () => {
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['user'])

    const userId = cookies.UserId
    function haveSameKeys(obj1, obj2) {
        const keys1 = Object.keys(obj1).sort();
        const keys2 = Object.keys(obj2).sort();

        // Sprawdź, czy posortowane tablice kluczy są identyczne
        return JSON.stringify(keys1) === JSON.stringify(keys2);
    }

    const initialState = {
        profileDownloaded: false,
        importClicked: false,
        submitEditionClicked: true,
        deleteProfileClicked: false,
        importedData: false,
        user: null,
        editedUser: null
    };


    const reducer = (state, action) => {
        switch (action.type) {
            case 'DOWNLOAD_PROFILE':
                return { ...state, profileDownloaded: true };
            case 'SET_USER':
                return { ...state, user: action.payload, editedUser: action.payload };
            case 'IMPORT_CLICKED':
                return { ...state,
                    importClicked: true,
                    submitEditionClicked: false,
                    deleteProfileClicked: false,
                };
            case 'SUBMIT_EDITION_CLICKED':
                return { ...state,
                    submitEditionClicked: true,
                    importClicked: false,
                    deleteProfileClicked: false,

                };
            case 'DELETE_PROFILE_CLICKED':
                return { ...state,
                    deleteProfileClicked: !state.deleteProfileClicked,
                    submitEditionClicked: false,
                    importClicked: false,
                };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);
    const getUser =  async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: { userId }
            })
            await dispatch({type:'SET_USER', payload: response.data})
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getUser()
    }, [])


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log(file)
        setSelectedFile(file);
    };

    const handleImport = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);

                    const otherData1 = {
                        first_name: 'Jane',
                        dob_day: 20,
                        dob_month: 8,
                        dob_year: 1985,
                        show_gender: false,
                        gender_identity: 'female',
                        about: 'Lorem ipsum dolor sit amet.'
                    };

                    if (haveSameKeys(jsonData,otherData1)) {
                        try{
                            const response = await axios.patch('http://localhost:8000/user', { jsonData })
                            const success = response.status === 200
                            console.log('resdata',response.data)
                        } catch (err) {
                            console.log(err)
                        }
                    }

                } catch (error) {
                    console.error('Błąd parsowania pliku JSON:', error);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await axios.delete('http://localhost:8000/user', {
                params: { userId }
            })
            if (response.status === 200){
                logout()
            }
        } catch(err) {
            console.log(err)
        }
    }

    const logout = () => {
        removeCookie('UserId', cookies.UserId)
        removeCookie('AuthToken', cookies.AuthToken)
        navigate('/')
        window.location.reload()
    }

    return (
        <>
            <div className="profile-page">
                <div className="footer-button flex justify-around m-3 " >
                    <a className="fourth-button no-underline" download="CV.txt" href="../files/CV.txt">DOWNLOAD PROFILE</a>
                    <button className="third-button" onClick={() => dispatch({ type: 'IMPORT_CLICKED' })}>IMPORT</button>
                    <button className="primary-button" onClick={() => dispatch({ type: 'SUBMIT_EDITION_CLICKED' })}>DATA EDITION</button>
                    <button className="secondary-button hover:cursor-pointer" onClick={() => dispatch({ type: 'DELETE_PROFILE_CLICKED' })}>DELETE PROFILE</button>
                </div>
                <div>
                    {state.editedUser && state.submitEditionClicked ? <ProfileChange user={state.user}/> : null}
                </div>
                <div className="box-of-boxes">

                    {state.importClicked ? <div className="import-box box">
                        <input type="file" accept=".json" onChange={handleFileChange} className="json-import"/>
                        <button onClick={handleImport} className="json-import-button secondary-button">Importuj plik JSON</button>
                    </div> : null}

                    {state.deleteProfileClicked ? <div className="delete-box box">
                        <p className="text-2xl">ARE YOU SURE TO DELETE ACCOUNT?</p>
                        <button className="yes-button button" onClick={handleDelete}>YES</button>
                        <button className="no-button button" onClick={() => dispatch({ type: 'DELETE_PROFILE_CLICKED'})}>NO</button>
                    </div> : null}

            </div>
                <div className="footer-button flex justify-around m-3 " >

                    <button className="primary-button" onClick={() => navigate('/dashboard')}>COME BACK</button>

                </div>
            </div>
        </>
    )
}

export default Profile
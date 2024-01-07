import axios from "axios";
import { useEffect, useState, useMemo } from "react";

import { useCookies} from "react-cookie";

const  MatchesDisplay = ({matches, setClickedUser}) => {
    const [ matchedProfiles, setMatchedProfiles ] = useState([])
    const [regex, setRegex] = useState(new RegExp(""))
    const [cookies, setCookie, removeCookie] = useCookies(null)
    const userId = cookies.UserId
    const getMatches = async () => {
        const matchedUserIds = matches.map(({user_Id}) => user_Id)

        try {
            const response = await axios.get('http://localhost:8000/users', {
                params: {
                        userIds: JSON.stringify(matchedUserIds)
                }
            })
            await setMatchedProfiles(response.data)
        } catch (err){
            console.log(err)
        }
    }

    useEffect(() => {
        getMatches()
    }, [matches]);


    const filteredMatchedProfiles = useMemo(() => {
        return matchedProfiles
            ?.filter((x) => regex.test(x.first_name))
            .filter(matchedProfile =>
                matchedProfile.matches.some(profile => profile.user_id === userId)
            )

    }, [matchedProfiles, userId,regex]);


    useEffect(() => {
        console.log(matchedProfiles)
    },[matchedProfiles])
    const handleFilter = async (e) => {
        await setRegex(new RegExp(e.target.value, 'i'));
    };

    return (
        <div className="m-3 shadow-lg">
            <div className="search-engine p-4 ">
                <label className="text-lg m-4">Filtruj po imieniu </label>
                <input  className="search-input fourth-button" type="text" onChange={handleFilter}/>
            </div>

            {filteredMatchedProfiles?.map((match, _index) =>
                ( <div key={match.user_id} className="match-card p-4 hover:cursor-pointer hover:shadow" onClick={() => setClickedUser(match)}>
                        <div className="img-container">
                            <img src={match?.url} alt={match?.first_name + 'profile'}/>
                        </div>
                        <h3>{match?.first_name}</h3>
                    </div>
                    ))}
        </div>
    )
}

export default MatchesDisplay
import {useState, useEffect, useContext} from "react";
import UserContext from "../contexts/UserContext.js";
import {getRanking} from "../api/api.js";


function RankingPage() {
    const user = useContext(UserContext)
    const [ranking, setRanking] = useState([])

    useEffect(() => {
        getRanking().then(setRanking)
    }, [])

    return(
        <>
            <h2>Ranking</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Best score</th>
                    </tr>
                </thead>
                <tbody>
                {ranking.map((entry)=> (
                    <tr key={entry.username} style={{fontWeight: entry.username === user.username ? 'bold': 'normal'}}>
                        <td>{entry.username}</td>
                        <td>{entry.best_score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}

export default RankingPage;
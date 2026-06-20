import {useState, useEffect, useContext} from "react";
import UserContext from "../contexts/UserContext.js";
import {getRanking} from "../api/api.js";
import {useNavigate} from "react-router";


function RankingPage() {
    const user = useContext(UserContext)
    const [ranking, setRanking] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        getRanking().then(setRanking)
    }, [])

    return(
        <div className="card-surface ranking-card">
            <h2>Ranking</h2>
            <table className="nomad-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Best score</th>
                    </tr>
                </thead>
                <tbody>
                {ranking.map((entry, index)=> (
                    <tr key={entry.username} className={entry.username === user.username ? 'current-user' : ''}>
                        <td>{index + 1}</td>
                        <td>{entry.username}</td>
                        <td>{entry.best_score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button className="btn-outline-gold ranking-back-btn" onClick={() => navigate('/home')}>Back to home</button>
        </div>
    )
}

export default RankingPage;
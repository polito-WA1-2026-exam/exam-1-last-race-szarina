import {useState, useContext} from "react"
import {useNavigate} from "react-router"
import UserContext from "../contexts/UserContext.js"
import InstructionsText from "./InstructionsText.jsx"
import {TrophyIcon, PlayIcon, BookIcon, ExitIcon} from "./Icons.jsx"

function HomePage() {
    const user = useContext(UserContext)
    const navigate = useNavigate()
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <div className="home-page-bg">
            <div className="card-surface home-card">
                <h1 className="home-title">Welcome, {user.username}!</h1>
                <div className="home-divider"></div>

                <div className="home-actions">
                    <button className="btn-gold" onClick={() => navigate('/ranking')}>
                        <TrophyIcon/> Ranking
                    </button>
                    <button className="btn-gold" onClick={() => navigate('/game')}>
                        <PlayIcon/> Play
                    </button>
                    <button className="btn-outline-gold" onClick={() => setShowInstructions(!showInstructions)}>
                        <BookIcon/> How to play
                    </button>
                    <button className="btn-outline-gold" onClick={() => navigate('/logout')}>
                        <ExitIcon/> Logout
                    </button>
                </div>

                {showInstructions && (
                    <div className="card-surface instructions-card">
                        <h4 className="instructions-title">How to play</h4>
                        <InstructionsText/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage
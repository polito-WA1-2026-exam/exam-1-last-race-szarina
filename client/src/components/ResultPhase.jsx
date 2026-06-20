import {useNavigate} from "react-router";
import {CoinIcon} from "./Icons.jsx"

function ResultPhase({ finalCoins, onPlayAgain, invalidReason }) {
    const navigate = useNavigate()
    return (
        <div className="card-surface result-card">
            {invalidReason ?(
                <>
                    <h2 className="result-title invalid">Invalid route</h2>
                    <p>{invalidReason}</p>
                    <p>You lost all your coins</p>
                </>
            ):(
                <>
                    <h2 className="result-title">Journey complete!</h2>
                    <p>You arrived safely.</p>
                </>
                )}
            <div className="final-score">
                <span className="eyebrow">Final score</span>
                <div className="score-value">{finalCoins} <CoinIcon size={34} /></div>
            </div>
            <div className="result-actions">
                <button className="btn-gold" onClick={onPlayAgain}>Play again</button>
                <button className="btn-outline-gold" onClick={() => navigate('/home')}>Go to home</button>
            </div>
        </div>
    )
}

export default ResultPhase
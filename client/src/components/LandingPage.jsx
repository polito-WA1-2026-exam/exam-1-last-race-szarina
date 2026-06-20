import {useState} from "react"
import InstructionsText from "./InstructionsText.jsx"

function LandingPage({onGoToLogin}) {
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <div className="card-surface landing-card">
            <h1>Last Race</h1>
            <p className="eyebrow">Start your journey!</p>

            <div className="button-stack">
                <button className="btn-gold" onClick={onGoToLogin}>Login</button>
                <button className="btn-outline-gold" onClick={() => setShowInstructions(!showInstructions)}>
                    {showInstructions ? 'Hide instructions' : 'How to play'}
                </button>
            </div>

            {showInstructions && (
                <div className="instructions-block">
                    <InstructionsText/>
                </div>
            )}
        </div>
    )
}

export default LandingPage
import { useState, useContext } from "react"
import { useNavigate } from "react-router"
import { Button } from "react-bootstrap"
import UserContext from "../contexts/UserContext.js"
import InstructionsText from "./InstructionsText.jsx"

function HomePage() {
    const user = useContext(UserContext)
    const navigate = useNavigate()
    const [showInstructions, setShowInstructions] = useState(false)

    return (
        <>
            <h1>Welcome, {user.username}</h1>
            <Button onClick={() => navigate('/ranking')}>Ranking</Button>
            <Button onClick={() => navigate('/game')}>Play</Button>
            <Button onClick={() => navigate('/logout')}>Logout</Button>
            <Button onClick={() => setShowInstructions(!showInstructions)}>
                {showInstructions ? 'Hide instructions' : 'How to play'}
            </Button>
            {showInstructions && <InstructionsText />}
        </>
    )
}

export default HomePage
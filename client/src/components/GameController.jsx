import {useState} from "react"
import {createGame, submitRoute} from "../api/api.js"
import SetupPhase from "./SetupPhase.jsx"
import PlanningPhase from "./PlanningPhase.jsx"
import ExecutionPhase from "./ExecutionPhase.jsx"
import ResultPhase from "./ResultPhase.jsx"

const PHASES = {
    SETUP: 'setup',
    PLANNING: 'planning',
    EXECUTION: 'execution',
    RESULT: 'result'
}

function GameController() {
    const [phase, setPhase] = useState(PHASES.SETUP)
    const [gameId, setGameId] = useState(null)
    const [startStation, setStartStation] = useState(null)
    const [destStation, setDestStation] = useState(null)
    const [steps, setSteps] = useState([])
    const [finalCoins, setFinalCoins] = useState([])
    const [invalidReason, setInvalidReason] = useState(null)

    const handleReady = () => {
        createGame().then((game) => {
            setGameId(game.gameId)
            setStartStation(game.startStation)
            setDestStation(game.destStation)
            setPhase(PHASES.PLANNING)
        })
    }

    const handleSubmitRoute = (connectionIds) => {
        submitRoute(gameId, connectionIds).then((result) => {
            if (result.valid) {
                setSteps(result.steps)
                setFinalCoins(result.coins_final)
                setInvalidReason(null)
                setPhase(PHASES.EXECUTION)
            } else {
                setSteps([])
                setFinalCoins(0)
                setInvalidReason(result.reason)
                setPhase(PHASES.RESULT)
            }
        })
    }

    const handlePlayAgain = () => {
        setPhase(PHASES.SETUP)
        setGameId(null)
        setStartStation(null)
        setDestStation(null)
        setSteps([])
        setFinalCoins(null)
        setInvalidReason(null)
    }

    if (phase === PHASES.SETUP) {
        return <SetupPhase onReady={handleReady}/>
    }
    if (phase === PHASES.PLANNING) {
        return <PlanningPhase startStation={startStation} destStation={destStation} onSubmitRoute={handleSubmitRoute}/>
    }
    if (phase === PHASES.EXECUTION) {
        return <ExecutionPhase steps={steps} onDone={() => setPhase(PHASES.RESULT)}/>
    }
    if (phase === PHASES.RESULT) {
        return <ResultPhase finalCoins={finalCoins} onPlayAgain={handlePlayAgain} invalidReason={invalidReason}/>
    }
}

export default GameController
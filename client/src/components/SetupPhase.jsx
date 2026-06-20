import {useState, useEffect} from "react"
import { getNetwork } from "../api/api.js"
import NetworkMap from "./NetworkMap.jsx"

function SetupPhase({onReady}) {
    const [network, setNetwork] = useState(null)

    useEffect(() => {
        getNetwork().then(setNetwork)
    }, [])

    if(!network){
        return <p>Loading map....</p>
    }

    return (
        <>
            <h2>Study the network</h2>
            <NetworkMap lines={network.lines} stations={network.stations} connections={network.connections} mode="full" />
            <button onClick={onReady}>I'm ready</button>
        </>
    )
}
export default SetupPhase
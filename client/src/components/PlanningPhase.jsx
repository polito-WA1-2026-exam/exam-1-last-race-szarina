import { useState, useEffect } from "react"
import { getSegments, getStations } from "../api/api.js"
import NetworkMap from "./NetworkMap.jsx"
import Timer from "./Timer.jsx"

function PlanningPhase({ startStation, destStation, onSubmitRoute }) {
    const [segments, setSegments] = useState([])
    const [stations, setStations] = useState([])
    const [selectedIds, setSelectedIds] = useState([])

    useEffect(() => {
        getSegments().then(setSegments)
        getStations().then(setStations)
    }, [])

    const handleSelectSegment = (segment) => {
        setSelectedIds([...selectedIds, segment.id])
    }

    const handleRemoveLast = () => {
        setSelectedIds(selectedIds.slice(0, -1))
    }

    const handleSubmit = () => {
        onSubmitRoute(selectedIds)
    }

    return (
        <>
            <Timer seconds={90} onExpire={handleSubmit} />
            <h3>From {startStation.name} to {destStation.name}</h3>

            <NetworkMap stations={stations} mode="dots-only" />

            <div>
                <h4>Available segments</h4>
                {segments.map((seg) => (
                    <button key={seg.id} onClick={() => handleSelectSegment(seg)}>
                        {seg.station_1} — {seg.station_2}
                    </button>
                ))}
            </div>

            <div>
                <h4>Your route</h4>
                {selectedIds.map((id) => {
                    const seg = segments.find(s => s.id === id)
                    return <span key={id}>{seg.station_1} — {seg.station_2}</span>
                })}
                {selectedIds.length > 0 && (
                    <button onClick={handleRemoveLast}>Remove last</button>
                )}
            </div>

            <button onClick={handleSubmit}>Submit route</button>
        </>
    )
}

export default PlanningPhase
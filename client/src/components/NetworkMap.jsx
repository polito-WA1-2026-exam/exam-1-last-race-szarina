const STATION_POSITIONS = {
    'Alashan': {x: 50, y: 180},
    'Dostyk': {x: 200, y: 170},
    'Abai': {x: 340, y: 160},
    'Baiterek': {x: 480, y: 180},
    'Turan': {x: 580, y: 280},
    'Astana': {x: 700, y: 300},
    'Esil': {x: 220, y: 50},
    'Shymkent': {x: 210, y: 290},
    'Otrar': {x: 200, y: 400},
    'Taldykorgan': {x: 90, y: 500},
    'Balkash': {x: 60, y: 400},
    'Taraz': {x: 340, y: 410},
    'Zhayyq': {x: 480, y: 400},
    'Altai': {x: 500, y: 510},
    'Nur': {x: 620, y: 130},
    'Saryarka': {x: 620, y: 400},
    'Atyrau': {x: 60, y: -50},
    'Karagandy': {x: 350, y: -70},
    'Pavlodar': {x: 510, y: -10},
}

const DOT_INTERCHANGE_FILL = '#FFFCF5'
const DOT_REGULAR_FILL = '#8B6914'
const DOT_STROKE = '#5A4A2A'
const LABEL_COLOR = '#3A2E14'

function NetworkMap({lines, stations, connections, mode}) {
    return (
        <svg viewBox="0 -100 760 650"
             style={{width: '100%', maxWidth: '700px', height: 'auto', display: 'block', margin: '0 auto'}}>
            {mode === 'full' && connections.map((conn) => {
                const line = lines.find(l => l.id === conn.line_id)
                const pos1 = STATION_POSITIONS[conn.station_1]
                const pos2 = STATION_POSITIONS[conn.station_2]
                if (!pos1 || !pos2 || !line) return null
                return (
                    <line
                        key={conn.id}
                        x1={pos1.x} y1={pos1.y}
                        x2={pos2.x} y2={pos2.y}
                        stroke={line.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                )
            })}

            {stations.map((station) => {
                const pos = STATION_POSITIONS[station.name]
                if (!pos) return null
                const showInterchange = mode === 'full' && station.is_interchange
                return (
                    <g key={station.id}>
                        <circle
                            cx={pos.x} cy={pos.y}
                            r={showInterchange ? 9 : 5}
                            fill={showInterchange ? DOT_INTERCHANGE_FILL : DOT_REGULAR_FILL}
                            stroke={DOT_STROKE}
                            strokeWidth={showInterchange ? 2.5 : 1.5}
                        />
                        <text
                            x={pos.x} y={pos.y - 14}
                            textAnchor="middle"
                            fontSize="15"
                            fontFamily="'Inter', sans-serif"
                            fill={LABEL_COLOR}
                        >
                            {station.name}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

export default NetworkMap

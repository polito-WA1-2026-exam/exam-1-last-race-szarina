export function CoinIcon({size = 18}) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24"
             style={{display: 'inline-block', verticalAlign: 'middle', position: 'relative', top: '-2px'}}>
            <circle cx="12" cy="12" r="10" fill="#C9A227" stroke="#8B6914" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="6.5" fill="none" stroke="#8B6914" strokeWidth="1" opacity="0.5"/>
        </svg>
    )
}

export function TrophyIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M8 4h8v4a4 4 0 01-8 0V4z"/>
            <path d="M8 5H5a2 2 0 002 4M16 5h3a2 2 0 01-2 4"/>
            <path d="M10 12v3M14 12v3M8 19h8M9 19v-2a3 3 0 016 0v2"/>
        </svg>
    )
}

export function PlayIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4l14 8-14 8V4z"/>
        </svg>
    )
}

export function BookIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 5a2 2 0 012-2h6v18H5a2 2 0 01-2-2V5z"/>
            <path d="M21 5a2 2 0 00-2-2h-6v18h6a2 2 0 002-2V5z"/>
        </svg>
    )
}

export function ExitIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
            <path d="M10 17l5-5-5-5M15 12H3"/>
        </svg>
    )
}
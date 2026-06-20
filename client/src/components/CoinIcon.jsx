function CoinIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle', position: 'relative', top: '-2px' }}>
            <circle cx="12" cy="12" r="10" fill="#C9A227" stroke="#8B6914" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="6.5" fill="none" stroke="#8B6914" strokeWidth="1" opacity="0.5" />
        </svg>
    )
}

export default CoinIcon
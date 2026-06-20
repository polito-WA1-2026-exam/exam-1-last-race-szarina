import {useState} from 'react'

function ExecutionPhase({ steps, onDone }) {
    const [currentStepIndex , setCurrentStepIndex] = useState(0)

    const currentStep = steps[currentStepIndex]
    const isLastStep = currentStepIndex === steps.length - 1

    const handleNext = () => {
        if (isLastStep) {
            onDone()
        } else {
            setCurrentStepIndex(currentStepIndex + 1)
        }
    }

    return (
        <div style={{display: 'flex', gap: '2rem'}}>
            <div>
                <h4>Your journey</h4>
                {steps.map((step, index) => (
                    <p
                        key={step.connection_id}
                        style={{
                            fontWeight: index === currentStepIndex ? 'bold' : 'normal',
                            color: index === currentStepIndex ? 'blue' : 'black',
                        }}
                    >
                        {step.from_station} - {step.to_station}
                    </p>
                ))}
            </div>

            <div>
                <h4> Step {currentStepIndex + 1}/{steps.length}</h4>
                <p>{currentStep.from_station} → {currentStep.to_station}</p>
                <p>Event: {currentStep.event_description} ({currentStep.event_effect >=0 ? '+': ''}{currentStep.event_effect} coins)</p>
                <p>Coins: {currentStep.coins_after}</p>
                <button onClick={handleNext}>
                    {isLastStep ? 'Finish': 'Next step'}</button>
            </div>
        </div>
    )
}

export default ExecutionPhase
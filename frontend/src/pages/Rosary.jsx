import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BackButton from '../components/BackButton'
import { MYSTERIES, PRAYERS, getTodaysMysteries, buildRosarySteps } from '../data/rosary'

function Rosary() {
  const navigate = useNavigate()
  const todaysMysteries = getTodaysMysteries()

  const [selectedMystery, setSelectedMystery] = useState(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [finished, setFinished] = useState(false)

  function startRosary(mysteryName) {
    const mysterySet = { name: mysteryName, ...MYSTERIES[mysteryName] }
    const rosarySteps = buildRosarySteps(mysterySet)
    setSelectedMystery(mysterySet)
    setSteps(rosarySteps)
    setCurrentStep(0)
    setFinished(false)
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setFinished(true)
    }
  }

  function handleRestart() {
    setSelectedMystery(null)
    setSteps([])
    setCurrentStep(0)
    setFinished(false)
  }

  function renderStep(step) {
    if (step.type === 'prayer') {
      const prayer = PRAYERS[step.prayer]
      return (
        <div className="rosary-step">
          <p className="rosary-step-label">{prayer.name}</p>
          <p className="rosary-step-text">{prayer.text}</p>
        </div>
      )
    }

    if (step.type === 'hailMary') {
      const prayer = PRAYERS.hailMary
      return (
        <div className="rosary-step">
          <p className="rosary-step-label">
            {step.total === 3
              ? `Hail Mary — for ${step.intention}`
              : `Hail Mary ${step.count} of ${step.total}`
            }
          </p>
          <p className="rosary-step-text">{prayer.text}</p>
        </div>
      )
    }

    if (step.type === 'mystery') {
      return (
        <div className="rosary-step">
          <p className="rosary-step-eyebrow">The {step.decadeNum === 1 ? 'First' : step.decadeNum === 2 ? 'Second' : step.decadeNum === 3 ? 'Third' : step.decadeNum === 4 ? 'Fourth' : 'Fifth'} Mystery</p>
          <p className="rosary-step-mystery-name">{step.mystery.name}</p>
          <p className="rosary-step-meditation">{step.mystery.meditation}</p>
        </div>
      )
    }
  }

  function getProgress() {
    if (steps.length === 0) return 0
    return Math.round((currentStep / (steps.length - 1)) * 100)
  }

  // Selection screen
  if (!selectedMystery) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton />
          <p className="readings-eyebrow">The Holy Rosary</p>
          <h1 className="rosary-title">Choose your mysteries</h1>
        </div>

        <div className="page-content">
          <div className="rosary-today">
            <p className="rosary-today-label">Suggested for today</p>
            <button
              className="rosary-today-btn"
              onClick={() => startRosary(todaysMysteries.name)}
            >
              {todaysMysteries.name} Mysteries
            </button>
          </div>

          <p className="rosary-or">— or choose —</p>

          <div className="rosary-mystery-list">
            {Object.keys(MYSTERIES).map(name => (
              <button
                key={name}
                className="rosary-mystery-btn"
                onClick={() => startRosary(name)}
              >
                <span className="rosary-mystery-name">{name} Mysteries</span>
                <span className="rosary-mystery-days">
                  {name === 'Joyful' ? 'Mon, Sat' :
                   name === 'Sorrowful' ? 'Tue, Fri' :
                   name === 'Glorious' ? 'Wed, Sun' : 'Thu'}
                </span>
              </button>
            ))}
          </div>
        </div>
        <NavBar />
      </div>
    )
  }

  // Finished screen
  if (finished) {
    return (
      <div className="page">
        <div className="page-header">
          <p className="readings-eyebrow">The Holy Rosary</p>
          <h1 className="rosary-title">{selectedMystery.name} Mysteries</h1>
        </div>

        <div className="page-content">
          <div className="rosary-finished">
            <p className="rosary-finished-title">✝</p>
            <p className="rosary-finished-text">
              You have completed the {selectedMystery.name} Mysteries of the Holy Rosary.
            </p>
            <p className="rosary-finished-sub">
              May Our Lady intercede for you and bring your prayers before her Son.
            </p>
            <button className="rosary-restart-btn" onClick={handleRestart}>
              Pray again
            </button>
          </div>
        </div>
        <NavBar />
      </div>
    )
  }

  // Praying screen
  const step = steps[currentStep]
  const progress = getProgress()

  return (
    <div className="page">
      <div className="page-header">
        <p className="readings-eyebrow">{selectedMystery.name} Mysteries</p>
        <div className="rosary-progress-bar">
          <div className="rosary-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="rosary-progress-text">{currentStep + 1} of {steps.length}</p>
      </div>

      <div className="page-content">
        {renderStep(step)}
      </div>

      <div className="rosary-next-container">
        <button className="rosary-next-btn" onClick={handleNext}>
          {currentStep < steps.length - 1 ? 'Next →' : 'Complete ✝'}
        </button>
      </div>

      <NavBar />
    </div>
  )
}

export default Rosary
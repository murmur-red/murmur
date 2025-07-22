import { useState, useEffect } from 'react'

const OnboardingQuestions = ({ onContinue }) => {
  const [goal, setGoal] = useState('')
  const [time, setTime] = useState('')
  const [skill, setSkill] = useState('')

  const isComplete = goal.trim() && time && skill

  useEffect(() => {
    const stored = localStorage.getItem('onboardingAnswers')
    if (stored) {
      const { goal, time, skill } = JSON.parse(stored)
      setGoal(goal)
      setTime(time)
      setSkill(skill)
    }
  }, [])

  const handleContinue = () => {
    const answers = { goal, time, skill }
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers))
    onContinue(answers)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Let’s get to know you</h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">1. What’s your dream or goal?</label>
        <input
          type="text"
          className="w-full border rounded p-3"
          placeholder="e.g. Build my own AI-powered website"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">2. How much time can you commit weekly?</label>
        <select
          className="w-full border rounded p-3"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          <option value="">Choose one</option>
          <option value="1–2 hours">1–2 hours</option>
          <option value="3–5 hours">3–5 hours</option>
          <option value="5+ hours">5+ hours</option>
        </select>
      </div>

      <div className="mb-8">
        <label className="block mb-2 font-semibold">3. What’s your current skill level?</label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <label key={lvl} className="flex flex-col items-center text-sm cursor-pointer">
              <input
                type="radio"
                name="skill"
                value={lvl}
                checked={skill === String(lvl)}
                onChange={(e) => setSkill(e.target.value)}
              />
              <span>{'★'.repeat(lvl)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          className={`px-6 py-3 rounded-lg text-white transition ${
            isComplete
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isComplete}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default OnboardingQuestions
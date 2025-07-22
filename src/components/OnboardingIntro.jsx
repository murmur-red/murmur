import { useEffect, useState } from 'react'
import { aiModels } from '../data/aiModels'

const OnboardingIntro = ({ onContinue }) => {
  const [intro, setIntro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchIntro = async () => {
      setLoading(true)
      try {
        const selectedMentor = localStorage.getItem('selectedMentor')
        const onboardingAnswers = JSON.parse(
          localStorage.getItem('onboardingAnswers')
        )

        if (!selectedMentor || !onboardingAnswers) {
          setError('Missing onboarding data. Please restart onboarding.')
          setLoading(false)
          return
        }

        const model = aiModels.find((m) => m.name === selectedMentor)
        if (!model) {
          setError('Selected mentor not found.')
          setLoading(false)
          return
        }

        const prompt = `
Create a warm, motivating 3-4 sentence welcome message for a new learner.
They have the goal: "${onboardingAnswers.goal}",
can commit: "${onboardingAnswers.time}" per week,
and rate their skill level as: "${onboardingAnswers.skill}/5".
Encourage them to start their AI journey with you as their mentor.
Sign the message with your model name.
        `

        const baseURL = import.meta.env.VITE_API_URL
        const res = await fetch(`${baseURL}${model.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        })

        const data = await res.json()
        setIntro(data.response)
      } catch (err) {
        setError('Failed to fetch intro. Try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchIntro()
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Your AI Mentor Welcomes You</h2>

      {loading && (
        <p className="text-center text-gray-600 dark:text-gray-300">Generating your welcome message...</p>
      )}

      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white dark:bg-zinc-900 border rounded-lg p-6 mb-8 shadow text-center whitespace-pre-line fade-in">
            {intro}
          </div>
          <div className="text-center">
            <button
              className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
              onClick={onContinue}
            >
              Let’s Begin
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default OnboardingIntro
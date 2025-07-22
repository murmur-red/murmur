import { useState, useEffect } from 'react'

const Roadmap = ({ onContinue }) => {
  const [roadmap, setRoadmap] = useState([])

  useEffect(() => {
    const onboardingAnswers = JSON.parse(localStorage.getItem('onboardingAnswers'))

    if (!onboardingAnswers) {
      setRoadmap([
        'Week 1: Foundations of Prompting',
        'Week 2: Exploring GPT4 Basics',
        'Week 3: Intermediate Prompt Design',
        'Week 4: Applying AI to Your Projects'
      ])
      return
    }

    const { goal, time, skill } = onboardingAnswers

    const roadmapGenerated = [
      `Week 1: Introduction to Prompting (${skill}/5 Skill)`,
      time.includes('5+') ? 'Week 2: Building Projects with AI Tools' : 'Week 2: Intermediate Prompt Techniques',
      time.includes('5+') ? 'Week 3: Advanced AI Integration' : 'Week 3: Practical Use Cases',
      `Week 4: Applying AI to "${goal}"`
    ]

    setRoadmap(roadmapGenerated)
    localStorage.setItem('userRoadmap', JSON.stringify(roadmapGenerated))
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Personalized Roadmap</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {roadmap.map((week, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 shadow bg-white dark:bg-zinc-900 transition-all fade-in"
          >
            <h3 className="text-lg font-semibold mb-2">{week.split(':')[0]}</h3>
            <p className="text-sm">{week.split(':')[1]}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
          onClick={onContinue}
        >
          Start Learning
        </button>
      </div>
    </div>
  )
}

export default Roadmap
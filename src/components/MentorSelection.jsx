import { useState, useEffect } from 'react'
import { aiData } from '../aiData'

const MentorSelection = ({ onContinue }) => {
  const [selected, setSelected] = useState(() =>
    localStorage.getItem('selectedMentor') || null
  )

  useEffect(() => {
    if (selected) localStorage.setItem('selectedMentor', selected)
  }, [selected])

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">
        Who do you want as your mentor?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {Object.keys(aiData).map((key) => (
          <div
            key={key}
            className={`rounded-xl border p-6 cursor-pointer transition-all ${
              selected === key.replace(/[- ]/g, '')
                ? 'border-blue-600 shadow-lg bg-blue-50 dark:bg-zinc-800'
                : 'hover:border-blue-300'
            }`}
            onClick={() => setSelected(key.replace(/[- ]/g, ''))}
          >
            <h3 className="text-xl font-semibold mb-2">{aiData[key].title}</h3>
            <p className="text-sm text-muted-foreground">{aiData[key].identity}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          className={`px-6 py-3 rounded-lg text-white transition ${
            selected
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selected}
          onClick={() => onContinue(selected)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default MentorSelection
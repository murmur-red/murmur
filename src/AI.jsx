import { useState } from 'react'
import { aiData } from './aiData'
import PromptPlayground from './components/PromptPlayground'

const AI = () => {
  const [selectedModel, setSelectedModel] = useState(null)
  const [view, setView] = useState('summary')

  const closeModal = () => {
    setSelectedModel(null)
    setView('summary')
  }

  const data = selectedModel ? aiData[selectedModel] : null

  return (
    <div className="w-full px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Explore AI Mentors</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {Object.keys(aiData).map((modelKey) => (
          <div
            key={modelKey}
            className="rounded-xl border p-6 shadow hover:shadow-xl cursor-pointer transition-all duration-200 dark:bg-zinc-900"
            onClick={() => setSelectedModel(modelKey)}
          >
            <h2 className="text-xl font-semibold mb-2">{aiData[modelKey].title}</h2>
            <p className="text-sm text-muted-foreground">{aiData[modelKey].identity}</p>
          </div>
        ))}
      </div>

      {selectedModel && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-4 text-zinc-500 hover:text-zinc-800 dark:hover:text-white text-xl"
              onClick={closeModal}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{data.identity}</p>

            <div className="flex gap-4 mb-6">
              <button
                className={`px-3 py-1 rounded ${
                  view === 'summary' ? 'bg-black text-white' : 'bg-gray-200'
                }`}
                onClick={() => setView('summary')}
              >
                Summary
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  view === 'details' ? 'bg-black text-white' : 'bg-gray-200'
                }`}
                onClick={() => setView('details')}
              >
                Deep Dive
              </button>
            </div>

            {view === 'summary' ? (
              <div className="text-sm leading-relaxed">
                <h4 className="font-semibold mt-4 mb-1">Strengths:</h4>
                <ul className="list-disc list-inside">
                  {data.strengths.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-4 mb-1">Limitations:</h4>
                <ul className="list-disc list-inside">
                  {data.limitations.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                <h4 className="font-semibold mt-4 mb-1">Use Cases:</h4>
                <ul className="list-disc list-inside">
                  {data.useCases.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <h4 className="font-semibold mt-4 mb-1">Example Prompts:</h4>
                <ul className="list-disc list-inside">
                  {data.prompts.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                <p className="mt-4"><strong>API:</strong> {data.api}</p>
                <p><strong>Safety:</strong> {data.safety}</p>
                <p><strong>Updated:</strong> {data.updated}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎯 Prompt Playground Section */}
      <PromptPlayground />
    </div>
  )
}

export default AI
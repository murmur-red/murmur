import { useState } from 'react'
import { aiData } from '../aiData'
import { aiModels } from '../data/aiModels'

const PromptPlayground = () => {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [mentor, setMentor] = useState(() => localStorage.getItem('selectedMentor') || null)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!prompt.trim()) return

    const userMessage = { role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    if (!mentor) {
      const systemPrompt = {
        role: 'system',
        content: "Before we continue, please select your AI mentor to guide your learning journey below."
      }
      setMessages((prev) => [...prev, systemPrompt])
      setPrompt('')
      setLoading(false)
      return
    }

    try {
      const model = aiModels.find((m) => m.name === mentor)
      const baseURL = import.meta.env.VITE_API_URL

      const res = await fetch(`${baseURL}${model.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()

      const mentorReply = {
        role: 'mentor',
        content: data.response
      }

      setMessages((prev) => [...prev, mentorReply])
    } catch (err) {
      console.error('Fetch error:', err)
      setMessages((prev) => [...prev, { role: 'system', content: "Something went wrong. Please try again." }])
    } finally {
      setPrompt('')
      setLoading(false)
    }
  }

  const handleMentorSelect = (selected) => {
    const cleaned = selected.replace(/[- ]/g, '')
    setMentor(cleaned)
    localStorage.setItem('selectedMentor', cleaned)

    const mentorData = aiData[cleaned]
    const welcomeMessage = {
      role: 'mentor',
      content: `🪄 ${mentorData.title} is now your guide! Ask your next question whenever you're ready.`
    }
    setMessages((prev) => [...prev, welcomeMessage])
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Learning Playground</h2>

      <div className="space-y-4 mb-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded ${
              msg.role === 'user' ? 'bg-blue-50 dark:bg-zinc-800' :
              msg.role === 'mentor' ? 'bg-green-50 dark:bg-zinc-800' :
              'bg-gray-100 dark:bg-zinc-700'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {!mentor && messages.some(m => m.role === 'system') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Object.keys(aiData).map((key) => (
            <div
              key={key}
              className="border rounded-lg p-4 shadow cursor-pointer hover:border-blue-500 transition-all bg-white dark:bg-zinc-800"
              onClick={() => handleMentorSelect(key)}
            >
              <h3 className="text-lg font-semibold mb-2">{aiData[key].title}</h3>
              <p className="text-sm">{aiData[key].identity}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <textarea
          className="w-full border rounded p-3 focus:outline-none"
          placeholder="Ask me anything to start learning..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={loading}
        />
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default PromptPlayground
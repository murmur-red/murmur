import { useState, useRef, useEffect } from 'react'
import { aiData } from '../aiData'

const ChatGPTPlayground = () => {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [mentor, setMentor] = useState(() => localStorage.getItem('selectedMentor') || null)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!prompt.trim()) return

    const userMessage = { role: 'user', content: prompt }
    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    if (!mentor) {
      const systemMsg = {
        role: 'system',
        content: 'Before we start, please select your AI mentor to guide your learning: GPT-4, Claude 3, or Gemini.'
      }
      setMessages((prev) => [...prev, systemMsg])
      setLoading(false)
      return
    }

    try {
      const baseURL = import.meta.env.VITE_API_URL
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      const aiMessage = { role: 'assistant', content: data.response }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'system', content: 'Oops, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleMentorSelect = (key) => {
    setMentor(key)
    localStorage.setItem('selectedMentor', key)
    const mentorMsg = {
      role: 'system',
      content: `You selected ${aiData[key].title} as your mentor! You can now ask your questions.`
    }
    setMessages((prev) => [...prev, mentorMsg])
  }

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[80vh]">
      <h2 className="text-3xl font-bold mb-4 text-center">murmur.red AI Mentor Chat</h2>

      <div className="flex-grow overflow-auto mb-4 border rounded p-4 bg-white dark:bg-zinc-900 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded max-w-[70%] ${
              msg.role === 'user'
                ? 'bg-blue-100 text-black self-end ml-auto'
                : msg.role === 'assistant'
                ? 'bg-green-100 text-black self-start mr-auto'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 self-start mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!mentor && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {Object.keys(aiData).map((key) => (
            <div
              key={key}
              onClick={() => handleMentorSelect(key)}
              className="cursor-pointer border rounded-lg p-4 shadow hover:border-blue-500 transition bg-white dark:bg-zinc-800"
            >
              <h3 className="text-xl font-semibold mb-2">{aiData[key].title}</h3>
              <p className="text-sm">{aiData[key].identity}</p>
            </div>
          ))}
        </div>
      )}

      <textarea
        rows={3}
        className="border rounded p-3 resize-none focus:outline-none focus:ring mb-2"
        placeholder="Type your question here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        disabled={loading}
      />

      <button
        onClick={handleSend}
        disabled={loading || !prompt.trim()}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  )
}

export default ChatGPTPlayground
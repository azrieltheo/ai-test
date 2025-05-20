import { useRef, useState } from 'react'
import './App.css'
import { Light as SyntaxHighlight } from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { requestToGroqAI } from "./utils/groq"

function parseBlocks(text) {
  const regex = /```(\w+)?\n?([\s\S]*?)```/g
  let lastIndex = 0
  let blocks = []
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    blocks.push({ type: 'code', lang: match[1] || 'text', content: match[2] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return blocks
}

function App() {
  const [content, setContent] = useState('')
  const [data, setdata] = useState('')
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const outputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setdata('')
    setDisplayed('')
    setIsTyping(true)
    const ai = await requestToGroqAI(content)
    const fullText = ai?.choices?.[0]?.message?.content || 'Tidak ada jawaban'
    setdata(fullText)
    let i = 0
    function typeWriter() {
      setDisplayed(fullText.slice(0, i))
      if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight
      }
      if (i < fullText.length) {
        i++
        setTimeout(typeWriter, 15)
      } else {
        setIsTyping(false)
      }
    }
    typeWriter()
  }

  return (
    <main className='flex flex-col min-h-[80vh] justify-center items-center max-w-2xl mx-auto'>
      <h1 className="text-4xl text-indigo-500">Sinau AI</h1>
      <form 
        className='flex flex-col gap-4 py-4 w-full'
        onSubmit={handleSubmit}
      >
        <input
          className='py-2 px-2 text-md rounded-md'
          id='content'
          placeholder='Masukkan permintaan Anda di sini'
          type='text'
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <button
          type='submit'
          className='bg-indigo-500 py-2 px-4 font-bold text-white rounded-md'
          disabled={isTyping}
        >
          {isTyping ? 'Mengetik...' : 'Kirim'}
        </button>
      </form>
      <div
        ref={outputRef}
        className='w-full max-w-2xl mt-4'
        style={{ maxHeight: '60vh', overflowY: 'auto', touchAction: 'pan-y', scrollBehavior: 'smooth', '-ms-overflow-style': 'none', scrollbarWidth: 'none' }}
      >
        {displayed && parseBlocks(displayed).map((block, idx) =>
          block.type === 'code' ? (
            <SyntaxHighlight
              key={idx}
              language={block.lang}
              style={darcula}
              wrapLongLines={true}
              customStyle={{ margin: '16px 0' }}
            >
              {block.content}
            </SyntaxHighlight>
          ) : (
            <div 
              key={idx} 
              className="mb-2 whitespace-pre-line text-white"
              style={{ backgroundColor: '#2D3748', padding: '10px', borderRadius: '5px' }}
            >
              {block.content}
            </div>
          )
        )}
        <style>
          {`
            div[style*='max-height: 60vh']::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </div>
    </main>
  )
}

export default App
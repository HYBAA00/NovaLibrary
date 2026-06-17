import React from 'react'
import { BrainCircuit, Crown, Trophy } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function QuizArena() {
  const { user } = React.useContext(AuthContext)
  const [leaderboard, setLeaderboard] = React.useState([])
  const [topic, setTopic] = React.useState('')
  const [difficulty, setDifficulty] = React.useState('medium')
  const [count, setCount] = React.useState(5)
  const [session, setSession] = React.useState(null)
  const [answers, setAnswers] = React.useState([])
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => { loadLeaderboard() }, [])

  async function loadLeaderboard() {
    try {
      const res = await api.get('/quiz/leaderboard')
      setLeaderboard(res.data || [])
    } catch {
      setLeaderboard([])
    }
  }

  async function startQuiz(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/quiz/start', { topic, difficulty, count })
      setSession(res.data)
      setAnswers(Array(res.data.questions.length).fill(null))
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de generer le QCM IA')
    } finally {
      setLoading(false)
    }
  }

  async function submitQuiz() {
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/quiz/${session.sessionId}/submit`, { answers })
      setResult(res.data)
      await loadLeaderboard()
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de soumettre le QCM')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page quiz-page">
      <AppHeader />
      <main className="container section">
        <div className="section-header">
          <div>
            <span className="eyebrow"><BrainCircuit size={16} /> QCM IA</span>
            <h1 style={{ margin: '12px 0 0' }}>Arena des lecteurs</h1>
            <p className="section-lead">Mistral genere des QCM depuis le catalogue. Repondez, gagnez des points et grimpez dans le ranking.</p>
          </div>
        </div>

        {!user && <div className="alert">Connectez-vous pour jouer et apparaitre dans le classement.</div>}
        {error && <div className="alert" style={{ marginBottom: 14 }}>{error}</div>}

        <section className="quiz-layout">
          <div className="panel">
            <form className="form-stack" onSubmit={startQuiz}>
              <h2 style={{ margin: 0 }}>Generer un QCM</h2>
              <input className="input" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Sujet: roman, science, histoire..." />
              <div className="form-row">
                <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="easy">Facile</option>
                  <option value="medium">Intermediaire</option>
                  <option value="hard">Expert</option>
                </select>
                <select className="select" value={count} onChange={e => setCount(Number(e.target.value))}>
                  <option value={3}>3 questions</option>
                  <option value={5}>5 questions</option>
                  <option value={8}>8 questions</option>
                  <option value={10}>10 questions</option>
                </select>
              </div>
              <button className="button button-primary" disabled={!user || loading}>{loading ? 'Generation...' : 'Lancer le QCM'}</button>
            </form>

            {session && (
              <div className="form-stack quiz-questions">
                {session.questions.map((question, qIndex) => (
                  <article className="review-card quiz-card" key={question.id}>
                    <h3>{qIndex + 1}. {question.question}</h3>
                    <div className="form-stack">
                      {question.options.map((option, optionIndex) => (
                        <button
                          type="button"
                          className={`quiz-option ${answers[qIndex] === optionIndex ? 'selected' : ''}`}
                          key={option}
                          onClick={() => {
                            const next = [...answers]
                            next[qIndex] = optionIndex
                            setAnswers(next)
                          }}
                          disabled={!!result}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {result?.details?.[qIndex] && (
                      <p className={result.details[qIndex].isCorrect ? 'success' : 'alert'} style={{ marginBottom: 0 }}>
                        {result.details[qIndex].isCorrect ? 'Correct.' : 'Incorrect.'} {result.details[qIndex].explanation}
                      </p>
                    )}
                  </article>
                ))}

                {!result ? (
                  <button className="button button-primary" disabled={answers.some(answer => answer === null) || loading} onClick={submitQuiz}>
                    Valider mes reponses
                  </button>
                ) : (
                  <div className="result-orbit">
                    <Trophy size={38} />
                    <strong>{result.score}%</strong>
                    <span>{result.points} points gagnes</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="panel">
            <h2 style={{ marginTop: 0 }}><Crown size={20} /> Ranking</h2>
            <div className="form-stack">
              {leaderboard.map((row, index) => (
                <div className="leader-row" key={row.id}>
                  <span className="rank">#{index + 1}</span>
                  <div>
                    <strong>{row.name || row.email}</strong>
                    <p className="muted">{row.attempts} tentative(s), best {row.best_score}%</p>
                  </div>
                  <strong>{row.points || 0} pts</strong>
                </div>
              ))}
              {leaderboard.length === 0 && <p className="muted">Aucun score pour le moment.</p>}
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

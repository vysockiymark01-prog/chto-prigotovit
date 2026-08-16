import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { STORAGE_KEYS } from '../lib/storageKeys.js'
import { pickJoke } from '../lib/votingJokes.js'
import './VotingPage.css'

function makeEntryId() {
  return `v-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

const RECENT_WINDOW = 3 // сколько последних раундов учитываем для штрафа за повтор
const REPEAT_PENALTY = 0.4

function normalize(name) {
  return name.trim().toLowerCase()
}

function weightFor(entry, recentWinners) {
  const base = 1 + entry.votes
  const isRecentWinner = recentWinners.includes(normalize(entry.name))
  return isRecentWinner ? base * REPEAT_PENALTY : base
}

function weightedPick(entries, recentWinners) {
  const weights = entries.map((e) => weightFor(e, recentWinners))
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < entries.length; i += 1) {
    r -= weights[i]
    if (r <= 0) return entries[i]
  }
  return entries[entries.length - 1]
}

export default function VotingPage() {
  const [entries, setEntries] = useLocalStorage(STORAGE_KEYS.votingState, [])
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.votingHistory, [])

  const [nameInput, setNameInput] = useState('')
  const [authorInput, setAuthorInput] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [highlightedId, setHighlightedId] = useState(null)
  const [result, setResult] = useState(null) // { entry, joke }
  const timerRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function addEntry() {
    const name = nameInput.trim()
    if (!name) return
    setEntries((prev) => [
      ...prev,
      { id: makeEntryId(), name, author: authorInput.trim(), votes: 0 },
    ])
    setNameInput('')
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function vote(id) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, votes: e.votes + 1 } : e)))
  }

  const recentWinners = history.slice(-RECENT_WINDOW).map((h) => normalize(h.winnerName))

  function spin() {
    if (entries.length < 2 || spinning) return
    setResult(null)
    setSpinning(true)

    const winner = weightedPick(entries, recentWinners)
    let ticks = 0
    const totalTicks = 16
    timerRef.current = setInterval(() => {
      ticks += 1
      const random = entries[Math.floor(Math.random() * entries.length)]
      setHighlightedId(random.id)
      if (ticks >= totalTicks) {
        clearInterval(timerRef.current)
        setHighlightedId(winner.id)
        const isRepeat = recentWinners.includes(normalize(winner.name))
        const joke = pickJoke(winner.name, isRepeat)
        setResult({ entry: winner, joke })
        setHistory((prev) => [
          ...prev,
          { date: new Date().toISOString().slice(0, 10), winnerName: winner.name },
        ])
        setSpinning(false)
      }
    }, 90)
  }

  function newRound() {
    setEntries([])
    setResult(null)
    setHighlightedId(null)
  }

  return (
    <div className="page">
      <h1 className="page-title">Семейное голосование</h1>
      <p className="price-disclaimer">
        Каждый добавляет свой вариант на этом же телефоне, можно голосовать за чужие варианты, а
        рандом выбирает победителя с учётом голосов — недавние победители получают меньший шанс,
        чтобы не приедалось.
      </p>

      <div className="voting-add card">
        <input
          type="text"
          className="voting-add__name"
          placeholder="Например, борщ"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addEntry()}
        />
        <input
          type="text"
          className="voting-add__author"
          placeholder="Кто предложил (необязательно)"
          value={authorInput}
          onChange={(e) => setAuthorInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addEntry()}
        />
        <button type="button" className="voting-add__btn" onClick={addEntry}>
          Добавить вариант
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="empty-state">Пока никто ничего не предложил. Добавьте первый вариант.</p>
      ) : (
        <ul className="voting-list">
          {entries.map((e) => (
            <li
              key={e.id}
              className={
                'voting-entry card' +
                (highlightedId === e.id ? ' voting-entry--highlighted' : '') +
                (result?.entry.id === e.id ? ' voting-entry--winner' : '')
              }
            >
              <div className="voting-entry__info">
                <span className="voting-entry__name">{e.name}</span>
                {e.author && <span className="voting-entry__author">от {e.author}</span>}
              </div>
              <div className="voting-entry__actions">
                <button
                  type="button"
                  className="voting-entry__vote"
                  onClick={() => vote(e.id)}
                  disabled={spinning}
                  aria-label={`Проголосовать за ${e.name}`}
                >
                  👍 {e.votes}
                </button>
                <button
                  type="button"
                  className="voting-entry__remove"
                  onClick={() => removeEntry(e.id)}
                  disabled={spinning}
                  aria-label={`Убрать ${e.name}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="invent-dish-btn"
        onClick={spin}
        disabled={entries.length < 2 || spinning}
      >
        {spinning ? '🎲 Крутим…' : '🎲 Выбрать, что готовим'}
      </button>
      {entries.length === 1 && (
        <p className="price-disclaimer">Нужно минимум два варианта, чтобы был выбор.</p>
      )}

      {result && (
        <div className="voting-result card">
          <div className="voting-result__title">Сегодня готовим: {result.entry.name}</div>
          <div className="voting-result__joke">{result.joke}</div>
        </div>
      )}

      {(entries.length > 0 || result) && (
        <button type="button" className="clear-btn" onClick={newRound}>
          Новый раунд
        </button>
      )}

      {history.length > 0 && (
        <>
          <h2 className="section-title">История голосований</h2>
          <ul className="voting-history card">
            {history
              .slice(-8)
              .reverse()
              .map((h, i) => (
                <li key={i} className="voting-history__row">
                  <span className="voting-history__date">
                    {new Date(h.date).toLocaleDateString('ru-RU')}
                  </span>
                  <span className="voting-history__name">{h.winnerName}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  )
}

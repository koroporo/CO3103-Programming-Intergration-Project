import { useEffect, useRef, useState } from 'react'
import {
  createAssessment,
  getAttemptHistory,
  getAttemptResult,
  getAuthoringData,
  getAvailableAssessments,
  saveAttemptAnswer,
  startAttempt,
  submitAttempt,
} from '../services/assessmentService'
import './AssessmentPage.css'

const TOKEN_KEY = 'authToken'

function makeQuestion(skillId = '') {
  return {
    prompt: '',
    skill_id: skillId,
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  }
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function AssessmentPage() {
  const [tokenDraft, setTokenDraft] = useState(
    () => window.sessionStorage.getItem(TOKEN_KEY) || '',
  )
  const [token, setToken] = useState(tokenDraft)
  const [mode, setMode] = useState('create')
  const [courses, setCourses] = useState([])
  const [assessments, setAssessments] = useState([])
  const [history, setHistory] = useState([])
  const [courseId, setCourseId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [title, setTitle] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [passingPercent, setPassingPercent] = useState(70)
  const [questions, setQuestions] = useState([makeQuestion()])
  const [activeAttempt, setActiveAttempt] = useState(null)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const pendingSaves = useRef(0)
  const saveQueue = useRef(Promise.resolve())

  const selectedCourse = courses.find((course) => course.id === courseId)
  const selectedLesson = selectedCourse?.lessons.find((lesson) => lesson.id === lessonId)
  const availableSkills = selectedLesson?.skills ?? []

  useEffect(() => {
    if (!token) return undefined

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (mode === 'create') {
          const data = await getAuthoringData(token)
          if (!cancelled) setCourses(data)
        } else if (mode === 'take') {
          const data = await getAvailableAssessments(token)
          if (!cancelled) setAssessments(data)
        } else {
          const data = await getAttemptHistory(token)
          if (!cancelled) setHistory(data)
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [mode, token])

  useEffect(() => {
    if (!activeAttempt) return undefined

    const updateRemaining = () => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((Date.parse(activeAttempt.expires_at) - Date.now()) / 1000)),
      )
    }
    updateRemaining()
    const intervalId = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(intervalId)
  }, [activeAttempt])

  function saveSessionToken(event) {
    event.preventDefault()
    const normalizedToken = tokenDraft.trim()
    window.sessionStorage.setItem(TOKEN_KEY, normalizedToken)
    setToken(normalizedToken)
    setError('')
    setNotice(normalizedToken ? 'Session token saved for this browser tab.' : '')
  }

  function updateQuestion(questionIndex, update) {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? update(question) : question,
      ),
    )
  }

  function updateOption(questionIndex, optionIndex, value) {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      options: question.options.map((option, index) =>
        index === optionIndex ? { ...option, text: value } : option,
      ),
    }))
  }

  function selectCorrectOption(questionIndex, optionIndex) {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      options: question.options.map((option, index) => ({
        ...option,
        is_correct: index === optionIndex,
      })),
    }))
  }

  function addQuestion() {
    setQuestions((current) => [...current, makeQuestion(availableSkills[0]?.id || '')])
  }

  function removeQuestion(questionIndex) {
    setQuestions((current) => current.filter((_, index) => index !== questionIndex))
  }

  function changeLesson(nextLessonId) {
    setLessonId(nextLessonId)
    const skillId = selectedCourse?.lessons
      .find((lesson) => lesson.id === nextLessonId)
      ?.skills[0]?.id || ''
    setQuestions((current) =>
      current.map((question) => ({ ...question, skill_id: skillId })),
    )
  }

  async function handleCreateAssessment(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const created = await createAssessment(token, {
        title,
        course_id: courseId,
        lesson_id: lessonId,
        time_limit_seconds: Number(timeLimit) * 60,
        max_attempts: Number(maxAttempts),
        passing_percent: Number(passingPercent),
        questions,
      })
      setNotice(`Quiz "${created.title}" is published and ready for enrolled learners.`)
      setTitle('')
      setQuestions([makeQuestion(availableSkills[0]?.id || '')])
    } catch (createError) {
      setError(createError.message)
    }
  }

  async function handleStartAttempt(assessmentId) {
    setError('')
    setNotice('')
    setResult(null)
    try {
      const attempt = await startAttempt(token, assessmentId)
      setActiveAttempt(attempt)
      setSelectedAnswers(
        Object.fromEntries(
          attempt.questions
            .filter((question) => question.selected_option_id)
            .map((question) => [question.attempt_question_id, question.selected_option_id]),
        ),
      )
    } catch (startError) {
      setError(startError.message)
    }
  }

  async function handleAnswerChange(attemptQuestionId, selectedOptionId) {
    setSelectedAnswers((current) => ({ ...current, [attemptQuestionId]: selectedOptionId }))
    pendingSaves.current += 1
    setSaving(true)
    setError('')

    const queuedSave = saveQueue.current
      .catch(() => {})
      .then(() =>
        saveAttemptAnswer(token, activeAttempt.id, {
          attempt_question_id: attemptQuestionId,
          selected_option_id: selectedOptionId,
        }),
      )
    saveQueue.current = queuedSave

    try {
      await queuedSave
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      pendingSaves.current -= 1
      if (pendingSaves.current === 0) setSaving(false)
    }
  }

  async function handleSubmitAttempt() {
    if (saving) return
    setError('')
    setNotice('')
    try {
      await saveQueue.current
      await submitAttempt(
        token,
        activeAttempt.id,
        Object.entries(selectedAnswers).map(([attemptQuestionId, selectedOptionId]) => ({
          attempt_question_id: attemptQuestionId,
          selected_option_id: selectedOptionId,
        })),
      )
      const attemptResult = await getAttemptResult(token, activeAttempt.id)
      setResult(attemptResult)
      setActiveAttempt(null)
      setNotice('Your answers were submitted and graded. Review the correct answers below.')
    } catch (submitError) {
      setError(submitError.message)
    }
  }

  async function handleViewResult(attemptId) {
    setError('')
    try {
      const attemptResult = await getAttemptResult(token, attemptId)
      setResult(attemptResult)
      setMode('history')
    } catch (resultError) {
      setError(resultError.message)
    }
  }

  function renderResult() {
    if (!result) return null

    const scorePercent = result.max_points
      ? Math.round((Number(result.score) / Number(result.max_points)) * 100)
      : 0

    return (
      <section className="assessment-result" aria-live="polite">
        <div className="result-heading">
          <div>
            <p className="eyebrow">Assessment result</p>
            <h2>{result.title}</h2>
          </div>
          <span className={result.is_passed ? 'result-badge passed' : 'result-badge failed'}>
            {result.is_passed ? 'Passed' : 'Not passed'}
          </span>
        </div>
        <p className="result-score">
          {result.score} / {result.max_points} points <span>({scorePercent}%)</span>
        </p>
        <div className="result-questions">
          {result.questions.map((question) => (
            <article className="result-question" key={`${result.id}-${question.position}`}>
              <h3>{question.position}. {question.prompt}</h3>
              <ul>
                {question.options.map((option) => (
                  <li
                    className={[
                      option.is_correct ? 'correct-option' : '',
                      option.is_selected && !option.is_correct ? 'selected-wrong-option' : '',
                    ].filter(Boolean).join(' ')}
                    key={option.id}
                  >
                    <span>{option.text}</span>
                    {option.is_selected && <span className="option-label">Your answer</span>}
                    {option.is_correct && <span className="option-label">Correct answer</span>}
                  </li>
                ))}
              </ul>
              <p className={question.is_correct ? 'answer-feedback correct' : 'answer-feedback incorrect'}>
                {question.is_correct
                  ? 'Correct'
                  : `Incorrect${question.selected_option_id ? '' : ' — unanswered'}. Correct answer: ${question.correct_option_text}`}
              </p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  return (
    <main className="assessment-shell">
      <header className="assessment-header">
        <div>
          <p className="eyebrow">Learning platform</p>
          <h1>Quizzes &amp; assessment history</h1>
          <p>Create four-option lesson quizzes, take enrolled-course assessments, and review every answer.</p>
        </div>
      </header>

      <section className="session-panel">
        <form onSubmit={saveSessionToken}>
          <label htmlFor="session-token">Access token</label>
          <input
            autoComplete="off"
            id="session-token"
            onChange={(event) => setTokenDraft(event.target.value)}
            placeholder="Paste your bearer token"
            type="password"
            value={tokenDraft}
          />
          <button className="button button-secondary" type="submit">Connect</button>
        </form>
        <p>Uses the existing login flow's JWT for the current browser tab.</p>
      </section>

      <nav aria-label="Assessment sections" className="assessment-tabs">
        {[
          ['create', 'Create quiz'],
          ['take', 'Take a quiz'],
          ['history', 'My history'],
        ].map(([value, label]) => (
          <button
            aria-current={mode === value ? 'page' : undefined}
            className={mode === value ? 'tab active' : 'tab'}
            key={value}
            onClick={() => {
              setMode(value)
              setError('')
              setNotice('')
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>

      {error && <div className="feedback-message error-message" role="alert">{error}</div>}
      {notice && <div className="feedback-message success-message" role="status">{notice}</div>}
      {loading && <p className="loading-message">Loading assessment data…</p>}

      {!token && (
        <p className="empty-state">
          Connect with an access token to load the courses and assessments available to your account.
        </p>
      )}

      {token && mode === 'create' && (
        <form className="quiz-form panel" onSubmit={handleCreateAssessment}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Instructor studio</p>
              <h2>Create a lesson quiz</h2>
            </div>
            <span className="muted-label">Single correct answer · 4 options</span>
          </div>

          <label>
            Quiz title
            <input
              maxLength={250}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>

          <div className="form-grid">
            <label>
              Course
              <select
                onChange={(event) => {
                  setCourseId(event.target.value)
                  setLessonId('')
                  setQuestions([makeQuestion()])
                }}
                required
                value={courseId}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </label>
            <label>
              Lesson
              <select
                disabled={!selectedCourse}
                onChange={(event) => changeLesson(event.target.value)}
                required
                value={lessonId}
              >
                <option value="">Select a lesson</option>
                {selectedCourse?.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedLesson && availableSkills.length === 0 && (
            <p className="feedback-message error-message">
              This lesson has no linked skills. Add a lesson skill or course skill before creating questions.
            </p>
          )}

          <div className="form-grid settings-grid">
            <label>
              Time limit (minutes)
              <input
                max="1440"
                min="1"
                onChange={(event) => setTimeLimit(event.target.value)}
                required
                type="number"
                value={timeLimit}
              />
            </label>
            <label>
              Maximum attempts
              <input
                max="100"
                min="1"
                onChange={(event) => setMaxAttempts(event.target.value)}
                required
                type="number"
                value={maxAttempts}
              />
            </label>
            <label>
              Passing score (%)
              <input
                max="100"
                min="0"
                onChange={(event) => setPassingPercent(event.target.value)}
                required
                type="number"
                value={passingPercent}
              />
            </label>
          </div>

          <div className="question-list">
            {questions.map((question, questionIndex) => (
              <fieldset className="question-editor" key={questionIndex}>
                <legend>
                  <span>Question {questionIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      className="text-button danger-text"
                      onClick={() => removeQuestion(questionIndex)}
                      type="button"
                    >
                      Remove
                    </button>
                  )}
                </legend>
                <label>
                  Question
                  <textarea
                    maxLength={5000}
                    onChange={(event) => updateQuestion(questionIndex, (current) => ({
                      ...current,
                      prompt: event.target.value,
                    }))}
                    required
                    rows="3"
                    value={question.prompt}
                  />
                </label>
                <label>
                  Skill
                  <select
                    onChange={(event) => updateQuestion(questionIndex, (current) => ({
                      ...current,
                      skill_id: event.target.value,
                    }))}
                    required
                    value={question.skill_id}
                  >
                    <option value="">Select a linked skill</option>
                    {availableSkills.map((skill) => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </label>
                <p className="option-instruction">Choose the radio button for the correct answer.</p>
                <div className="option-editor-list">
                  {question.options.map((option, optionIndex) => (
                    <div className="option-editor" key={optionIndex}>
                      <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                      <input
                        aria-label={`Option ${String.fromCharCode(65 + optionIndex)} for question ${questionIndex + 1}`}
                        maxLength={1000}
                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        required
                        value={option.text}
                      />
                      <input
                        aria-label={`Mark option ${String.fromCharCode(65 + optionIndex)} as correct`}
                        checked={option.is_correct}
                        name={`correct-option-${questionIndex}`}
                        onChange={() => selectCorrectOption(questionIndex, optionIndex)}
                        type="radio"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="form-actions">
            <button
              className="button button-secondary"
              disabled={questions.length >= 50 || availableSkills.length === 0}
              onClick={addQuestion}
              type="button"
            >
              Add question
            </button>
            <button
              className="button button-primary"
              disabled={loading || !token || availableSkills.length === 0}
              type="submit"
            >
              Publish quiz
            </button>
          </div>
        </form>
      )}

      {token && mode === 'take' && (
        <section className="panel">
          {activeAttempt ? (
            <div className="attempt-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Attempt #{activeAttempt.attempt_number}</p>
                  <h2>{activeAttempt.title || 'Lesson quiz'}</h2>
                </div>
                <span className={remainingSeconds ? 'timer-badge' : 'timer-badge expired'}>
                  {remainingSeconds ? formatDuration(remainingSeconds) : 'Time expired'}
                </span>
              </div>
              {activeAttempt.questions.map((question) => (
                <fieldset className="attempt-question" key={question.attempt_question_id}>
                  <legend>{question.position}. {question.prompt}</legend>
                  <div className="attempt-options">
                    {question.options.map((option, optionIndex) => (
                      <label className="attempt-option" key={option.id}>
                        <input
                          checked={selectedAnswers[question.attempt_question_id] === option.id}
                          disabled={!remainingSeconds}
                          name={`attempt-${question.attempt_question_id}`}
                          onChange={() => handleAnswerChange(question.attempt_question_id, option.id)}
                          type="radio"
                        />
                        <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <div className="form-actions">
                <span className="muted-label">{saving ? 'Saving answer…' : 'Answers are saved automatically.'}</span>
                <button
                  className="button button-primary"
                  disabled={saving}
                  onClick={handleSubmitAttempt}
                  type="button"
                >
                  {remainingSeconds ? 'Submit answers' : 'Submit expired attempt'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Learner space</p>
                  <h2>Available quizzes</h2>
                </div>
              </div>
              {assessments.length === 0 && !loading ? (
                <p className="empty-state">No published quizzes are available for your active course enrollments.</p>
              ) : (
                <div className="assessment-list">
                  {assessments.map((assessment) => (
                    <article className="assessment-card" key={assessment.id}>
                      <div>
                        <p className="eyebrow">{assessment.course_title} · {assessment.lesson_title}</p>
                        <h3>{assessment.title}</h3>
                        <p>{assessment.question_count} questions · {Math.ceil(assessment.time_limit_seconds / 60)} min · pass {assessment.passing_percent}%</p>
                      </div>
                      <button
                        className="button button-primary"
                        onClick={() => handleStartAttempt(assessment.id)}
                        type="button"
                      >
                        Start / resume
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {renderResult()}
        </section>
      )}

      {token && mode === 'history' && (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Learner space</p>
              <h2>Assessment history</h2>
            </div>
          </div>
          {history.length === 0 && !loading ? (
            <p className="empty-state">Submitted quiz attempts will appear here.</p>
          ) : (
            <div className="assessment-list">
              {history.map((attempt) => (
                <article className="assessment-card" key={attempt.id}>
                  <div>
                    <p className="eyebrow">{attempt.course_title} · {attempt.lesson_title}</p>
                    <h3>{attempt.title}</h3>
                    <p>
                      Attempt #{attempt.attempt_number} · {attempt.status}
                      {attempt.score !== null ? ` · ${attempt.score}/${attempt.max_points} points` : ''}
                    </p>
                  </div>
                  {attempt.status === 'graded' && (
                    <button
                      className="button button-secondary"
                      onClick={() => handleViewResult(attempt.id)}
                      type="button"
                    >
                      Review answers
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
          {renderResult()}
        </section>
      )}
    </main>
  )
}

export default AssessmentPage

function parseJson(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function gradeAttempt(questions, answers, passingPercent) {
  const gradedQuestions = questions.map((question) => {
    const payload = answers.get(String(question.id));
    const selectedOptionId = payload?.selected_option_id
      ? String(payload.selected_option_id)
      : null;
    const answerKey = parseJson(question.answer_key_snapshot);
    const correctOptionId = String(answerKey.correct_option_id);
    const maxPoints = Number(question.max_points);
    const isCorrect = selectedOptionId === correctOptionId;

    return {
      id: String(question.id),
      selectedOptionId,
      correctOptionId,
      awardedPoints: isCorrect ? maxPoints : 0,
      maxPoints
    };
  });

  const score = gradedQuestions.reduce((total, question) => total + question.awardedPoints, 0);
  const maxPoints = gradedQuestions.reduce((total, question) => total + question.maxPoints, 0);
  const scorePercent = maxPoints === 0 ? 0 : (score / maxPoints) * 100;

  return {
    questions: gradedQuestions,
    score,
    maxPoints,
    scorePercent,
    isPassed: scorePercent >= Number(passingPercent)
  };
}

module.exports = { gradeAttempt };

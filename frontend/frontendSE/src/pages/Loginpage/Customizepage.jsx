import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CustomizePage() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState("Speaking");
  const [level, setLevel] = useState("A2");
  const [dailyMinutes, setDailyMinutes] = useState("15");

  function handleSubmit(event) {
    event.preventDefault();

    const preferences = {
      goal,
      level,
      dailyMinutes: Number(dailyMinutes),
    };

    console.log("Learning preferences:", preferences);

    // Later, send preferences to your backend.
    // After saving successfully:
    navigate("/");
  }

  return (
    <div className="customize-page">
      <h1>Personalize Your Learning</h1>
      <p>Tell us about your English-learning goals.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="goal">What is your main goal?</label>
        <select
          id="goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        >
          <option value="Speaking">Improve speaking</option>
          <option value="Listening">Improve listening</option>
          <option value="Reading">Improve reading</option>
          <option value="Writing">Improve writing</option>
          <option value="Grammar">Improve grammar</option>
        </select>

        <label htmlFor="level">Your current English level</label>
        <select
          id="level"
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="A1">Beginner (A1)</option>
          <option value="A2">Elementary (A2)</option>
          <option value="B1">Intermediate (B1)</option>
          <option value="B2">Upper-intermediate (B2)</option>
          <option value="C1">Advanced (C1)</option>
        </select>

        <label htmlFor="dailyMinutes">
          How much time can you study daily?
        </label>
        <select
          id="dailyMinutes"
          value={dailyMinutes}
          onChange={(event) => setDailyMinutes(event.target.value)}
        >
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
        </select>

        <button type="submit">Start Learning</button>
      </form>
    </div>
  );
}
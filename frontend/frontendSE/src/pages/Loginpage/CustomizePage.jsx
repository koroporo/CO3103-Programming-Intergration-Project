import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { saveLearningPreferences } from "../../services/preferencesService";

export default function CustomizePage() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState("Speaking");
  const [level, setLevel] = useState("4.0");
  //const [dailyMinutes, setDailyMinutes] = useState("15");

  async function handleSubmit(event) {
    event.preventDefault();

    const preferences = {
      goal,
      level: Number(level),
      //dailyMinutes: Number(dailyMinutes),
    };
    try {
      const data = await saveLearningPreferences(preferences);

      console.log("Preferences saved:", data);
      navigate("/");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert(error.message);
    }
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
          <option value="3.0">3.0</option>
          <option value="4.0">4.0</option>
          <option value="5.0">5.0</option>
          <option value="5.5">5.5</option>
          <option value="6.0">6.0</option>
          <option value="6.5">6.5</option>
          <option value="7.0">7.0</option>
          <option value="7.5">7.5</option>
          <option value="8.0">8.0</option>
          <option value="8.5">8.5</option>
          <option value="9.0">9.0</option>
        </select>

        {/* <label htmlFor="dailyMinutes">
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
        </select */}

        <button type="submit">Start Learning</button>
      </form>
    </div>
  );
}

import "./ExercisesLayout.css";

export default function ExercisesLayout({ exercise }) {
  if (!exercise) {
    return (
      <div className="exercises-layout">
        <div className="exercises-layout__placeholder">
          <h3>No exercises available for this lesson</h3>
          <p>Please check back later or proceed to the next module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exercises-layout">
      <iframe
        src={exercise}
        title="Lesson exercises"
        allowFullScreen
      />
    </div>
  );
}
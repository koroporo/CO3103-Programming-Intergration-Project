export default function ExercisesLayout({ exercise }) {
    return (
        <div className="exercises-layout">
            <iframe src={exercise} width="100%" height="600px" allowFullScreen></iframe>
        </div>
    );
}
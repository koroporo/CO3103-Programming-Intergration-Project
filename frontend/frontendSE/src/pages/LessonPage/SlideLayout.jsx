import "./SlideLayout.css";

export default function SlideLayout({ slide }) {
  if (!slide) {
    return (
      <div className="slide-layout">
        <p>No slides available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="slide-layout">
      <iframe
        src={slide}
        title="Lesson slides"
        allowFullScreen
      />
    </div>
  );
}
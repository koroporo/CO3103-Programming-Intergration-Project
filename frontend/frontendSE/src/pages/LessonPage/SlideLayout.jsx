import './SlideLayout.css';
export default function SlideLayout({ slide }) {
    return (
        <div className="slide-layout">
            <iframe src={slide}  allowFullScreen></iframe>
        </div>
    );
}   
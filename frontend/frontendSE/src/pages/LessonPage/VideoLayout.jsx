import "./VideoLayout.css";

export default function VideoLayout({ videourl, videoThumbnail }) {
  if (!videourl) {
    return (
      <div className="video-layout">
        <p>No video available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="video-layout">
      <video
        controls
        playsInline
        poster={videoThumbnail || undefined}
      >
        <source src={videourl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
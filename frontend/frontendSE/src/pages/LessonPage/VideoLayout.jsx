import './VideoLayout.css';

export default function VideoLayout({videourl, videoThumbnail}) {
    return (
        <div className="video-layout">
            <video controls autoplay poster={videoThumbnail} playsinline src={videourl} type="video/mp4" >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
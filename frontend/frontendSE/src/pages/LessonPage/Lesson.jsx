import  { useState } from 'react';
import { lessons } from "../../data/lessons";
import { useParams } from "react-router-dom";
import Comments from './Comments';
import VideoLayout from './VideoLayout';
import SlideLayout from './SlideLayout';
import ExercisesLayout from './ExercisesLayout';
import './Lesson.css';


export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const [activeTab, setActiveTab] = useState('video');
  const lesson = lessons.find((l) => l.id === lessonId && l.courseId === courseId);

  if (!lesson) {
    return <p>Lesson not found.</p>;
  }

    return (
        <div>
        <div className="lesson-page">
            <h1>{lesson.title}</h1>
        </div>
        <nav>
          <button onClick={() => setActiveTab('video')}>Video</button>
          <button onClick={() => setActiveTab('slide')}>Slide</button>
          <button onClick={() => setActiveTab('exercise')}>Exercise</button>
        </nav>
        {activeTab === 'video' && <VideoLayout videoThumbnail={lesson.videoThumbnail} videourl={lesson.videoUrl} />} 
        {activeTab === 'slide' && <SlideLayout slide={lesson.slide} />}
        {/* {activeTab === 'exercise' && <ExercisesLayout exercise={lesson.quizUrl} />}  */}
        <h2>Comments</h2> 
        <Comments comments={lesson.comments} />
        </div>
    );
}
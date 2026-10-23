import { useState } from 'react';
import { lessons } from "../../data/lessons";
import { courses, featuredCourse } from "../../data/courses";
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
  const course = courses.find((c) => c.id === courseId) || (featuredCourse && featuredCourse.id === courseId ? featuredCourse : null);

  if (!lesson) {
    return (
      <div className="lesson-page-container">
        <a className="lesson-page__back" href={`/courses/${courseId}`}>
          <span aria-hidden="true">←</span> Back to course
        </a>
        <p>Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="lesson-page-container">
      <a className="lesson-page__back" href={`/courses/${courseId}`}>
        <span aria-hidden="true">←</span> Back to course
      </a>

      <header className="lesson-page__header">
        <h1 className="lesson-page__title">{lesson.title}</h1>
        {course && (
          <div className="lesson-page__instructor">
            <span className="lesson-page__avatar">{course.instructor?.charAt(0) || 'T'}</span>
            <span>Instructor: {course.instructor}</span>
          </div>
        )}
      </header>

      {/* Tabs navigation: Frame 8 in Figma (Video, Slide, Exercises) */}
      <nav className="lesson-tabs-nav" aria-label="Lesson content tabs">
        <button 
          onClick={() => setActiveTab('video')} 
          className={activeTab === 'video' ? 'active' : ''}
        >
          Video
        </button>
        <button 
          onClick={() => setActiveTab('slide')} 
          className={activeTab === 'slide' ? 'active' : ''}
        >
          Slide
        </button>
        <button 
          onClick={() => setActiveTab('exercise')} 
          className={activeTab === 'exercise' ? 'active' : ''}
        >
          Exercises
        </button>
      </nav>

      <div className="lesson-content-area">
        {activeTab === 'video' && (
          <VideoLayout 
            videoThumbnail={lesson.image || lesson.videoThumbnail} 
            videourl={lesson.videoUrl} 
          />
        )}
        {activeTab === 'slide' && (
          <SlideLayout slide={lesson.slide} />
        )}
        {activeTab === 'exercise' && (
          <ExercisesLayout exercise={lesson.quizUrl} />
        )}
      </div>

      <section className="lesson-comments-section" aria-label="Lesson comments">
        <h2>Comments</h2>
        <Comments comments={lesson.comments} />
      </section>
    </div>
  );
}

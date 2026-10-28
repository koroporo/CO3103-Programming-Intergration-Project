import { useEffect, useState } from "react";
import { courses, featuredCourse } from "../../data/courses";
import { useParams } from "react-router-dom";
import Comments from "./Comments";
import VideoLayout from "./VideoLayout";
import SlideLayout from "./SlideLayout";
import ExercisesLayout from "./ExercisesLayout";
import "./Lesson.css";

// Your backend serves lesson assets from localhost:3000.
function getAssetUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `http://localhost:3000${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function Lesson() {
  const { courseId, lessonId } = useParams();

  const [activeTab, setActiveTab] = useState("video");
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchLesson() {
      setLoading(true);
      setError("");
      setLesson(null);

      try {
        const response = await fetch(
          `http://localhost:3000/courses/${courseId}/lesson/${lessonId}/content`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch lesson content.");
        }

        if (!cancelled) {
          setLesson(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLesson();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const course =
    courses.find((c) => String(c.id) === courseId) ||
    (featuredCourse && String(featuredCourse.id) === courseId
      ? featuredCourse
      : null);

  // Find resources by their type instead of relying on static lesson data.
  const materials = lesson?.materials || [];

  const notes = materials.find((material) => material.material_type === "text");

  const slides = materials.find(
    (material) => material.material_type === "slides",
  );

  const quiz = materials.find((material) => material.material_type === "file");

  if (loading) {
    return (
      <div className="lesson-page-container">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="lesson-page-container">
        <a className="lesson-page__back" href={`/courses/${courseId}`}>
          <span aria-hidden="true">←</span> Back to course
        </a>
        <p>{error || "Lesson not found."}</p>
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
            <span className="lesson-page__avatar">
              {course.instructor?.charAt(0) || "T"}
            </span>
            <span>Instructor: {course.instructor}</span>
          </div>
        )}
      </header>

      <nav className="lesson-tabs-nav" aria-label="Lesson content tabs">
        <button
          onClick={() => setActiveTab("video")}
          className={activeTab === "video" ? "active" : ""}
        >
          Video
        </button>

        <button
          onClick={() => setActiveTab("slide")}
          className={activeTab === "slide" ? "active" : ""}
        >
          Slide
        </button>

        <button
          onClick={() => setActiveTab("exercise")}
          className={activeTab === "exercise" ? "active" : ""}
        >
          Exercises
        </button>

        <button
          onClick={() => setActiveTab("writing")}
          className={activeTab === "writing" ? "active" : ""}
        >
          Writing
        </button>
      </nav>

      <div className="lesson-content-area">
        {activeTab === "video" && (
          <>
            {lesson.video ? (
              <VideoLayout
                videoThumbnail={getAssetUrl(course?.thumbnail || course?.image)}
                videourl={getAssetUrl(lesson.video.video_url)}
              />
            ) : (
              <p>No video is available for this lesson.</p>
            )}

            {notes?.text_content && (
              <section>
                <h2>Lesson Notes</h2>
                <p>{notes.text_content}</p>
              </section>
            )}
          </>
        )}

        {activeTab === "slide" &&
          (slides?.resource_url ? (
            <SlideLayout slide={getAssetUrl(slides.resource_url)} />
          ) : (
            <p>No slides are available for this lesson.</p>
          ))}

        {activeTab === "exercise" &&
          (quiz?.resource_url ? (
            <ExercisesLayout exercise={getAssetUrl(quiz.resource_url)} />
          ) : (
            <p>No exercise resource is available for this lesson.</p>
          ))}

        {activeTab === "writing" && (
          <p>
            {lesson.writingAssignments?.length
              ? "Writing assignments are available, but submission integration is not connected yet."
              : "No writing assignments are available for this lesson."}
          </p>
        )}
      </div>

      <section className="lesson-comments-section" aria-label="Lesson comments">
        <h2>Comments</h2>
        <Comments comments={[]} />
      </section>
    </div>
  );
}


import { useEffect, useState } from "react";
import LessonCard from "../../components/CoursePage/LessonCard";
import "./CourseSyllabus.css";

export default function CourseSyllabus({ courseId }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSyllabus() {
      if (!courseId) {
        setError("Course ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // 1. Fetch chapters belonging to this course
        const chapterResponse = await fetch(
          `http://localhost:3000/courses/${courseId}/chapters`,
          { credentials: "include" }
        );

        const chapterResult = await chapterResponse.json();

        if (!chapterResponse.ok) {
          throw new Error(
            chapterResult.message || "Failed to load chapters."
          );
        }

        const chapterList = chapterResult.data ?? [];

        // 2. Fetch lessons belonging to each chapter
        const chaptersWithLessons = await Promise.all(
          chapterList.map(async (chapter) => {
            const lessonResponse = await fetch(
              `http://localhost:3000/courses/chapter/${chapter.id}/lessons`,
              { credentials: "include" }
            );

            const lessonResult = await lessonResponse.json();

            if (!lessonResponse.ok) {
              throw new Error(
                lessonResult.message ||
                  `Failed to load lessons for chapter ${chapter.id}.`
              );
            }

            return {
              ...chapter,
              lessons: lessonResult.data ?? []
            };
          })
        );

        if (!cancelled) {
          setChapters(chaptersWithLessons);
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

    fetchSyllabus();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="course-syllabus">
        <p>Loading syllabus...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-syllabus">
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="course-syllabus">
        <p>No chapters available for this course.</p>
      </div>
    );
  }

  return (
    <div className="course-syllabus">
      {chapters.map((chapter) => (
        <section
          className="course-syllabus__chapter"
          key={chapter.id}
        >
          <h2 className="course-syllabus__chapter-title">
            {chapter.title}
          </h2>

          {chapter.lessons.length === 0 ? (
            <p>No lessons available in this chapter.</p>
          ) : (
            <ol>
              {chapter.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <LessonCard
                    to={`/courses/${courseId}/${lesson.id}`}
                    title={lesson.title}
                    duration={
                      lesson.duration ??
                      (lesson.duration_seconds != null
                        ? `${Math.ceil(lesson.duration_seconds / 60)} min`
                        : "")
                    }
                    description={lesson.description ?? ""}
                    image={lesson.thumbnail_url ?? ""}
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}

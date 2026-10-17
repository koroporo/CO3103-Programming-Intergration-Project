import { lessons } from "../../data/lessons";
import LessonCard from "../../components/CoursePage/LessonCard";
export default function CourseSyllabus({ courseId }) {
  const items = lessons.filter((lesson) => lesson.courseId === courseId);
  if (items.length === 0) {
    return (    <div className="course-syllabus">
                   <p>No lessons available.</p>
                </div>);
  }
  return (
    <div className="course-syllabus">
      <ol type="1">
        {items.map((item) => <LessonCard  to={`/courses/${item.courseId}/${item.id}`} title={item.title} duration={item.duration} description={item.description} image={item.image} />)}
      </ol>
    </div>
  );
}

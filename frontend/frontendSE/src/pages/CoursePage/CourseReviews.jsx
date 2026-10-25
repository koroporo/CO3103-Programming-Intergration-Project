import ReviewCard from "../../components/CoursePage/ReviewCard";


export default function CourseReviews({ reviews }) {
    const items = Array.isArray(reviews) ? reviews : [];
    return (
    <div className="course-reviews">
      {items.length === 0 && <p>No reviews yet.</p>}
      {items.map((review) => (
        <ReviewCard reviewer={review.reviewer} rating={review.rating} comment={review.comment} time={review.time} />
      ))}
    </div>
  );
}
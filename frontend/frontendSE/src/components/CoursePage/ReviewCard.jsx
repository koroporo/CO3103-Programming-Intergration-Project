import './ReviewCard.css';

export default function ReviewCard({ reviewer, rating, comment, time }) {
   return (
     <div className="review-card">
       <div className="review-card__header">
         <strong>{reviewer}</strong>
         <span> {"★".repeat(rating)} · {time}</span>
       </div>
       <p>{comment}</p>
     </div>
   );
 }
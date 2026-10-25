import MaterialCard from "../../components/CoursePage/MaterialCard";

export default function CourseMaterials({ materials }) {
  const items = Array.isArray(materials) ? materials : [];

  return (
    <div className="course-material">
      {items.length === 0 && <p>No materials available.</p>}
      <ol type="1">
        {items.map((item, index) => (
          <li key={index}>
            <MaterialCard title={item.title} description={item.description} url={item.url} />
          </li>
        ))}
      </ol>
    </div>
  );
}
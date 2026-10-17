import { Link } from "react-router-dom";
import './MaterialCard.css';

export default function MaterialCard({ title, description, url }) {
    return (

        <Link to={url} target="_blank" rel="noopener noreferrer" className="material-card">
            <h3>{title}</h3>
            {description && <p>{description}</p>}
        </Link>
    )


}
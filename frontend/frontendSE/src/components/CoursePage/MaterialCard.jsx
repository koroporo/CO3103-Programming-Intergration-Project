import { Link } from "react-router-dom";
import SvgIcon from "../Common/SvgIcon";
import './MaterialCard.css';

export default function MaterialCard({ title, description, url }) {
  const getBadgeType = (linkStr, titleStr) => {
    const combined = `${linkStr || ''} ${titleStr || ''}`.toLowerCase();
    if (combined.includes('.pdf') || combined.includes('pdf')) return 'PDF';
    if (combined.includes('.doc') || combined.includes('docx') || combined.includes('word')) return 'DOCX';
    return 'LINK';
  };

  const badge = getBadgeType(url, title);
  const iconName = badge === 'LINK' ? 'link' : 'file';

  return (
    <Link to={url} target="_blank" rel="noopener noreferrer" className="material-card">
      <div className="material-card__icon-box" aria-hidden="true">
        <SvgIcon name={iconName} size={20} color="#800600" />
      </div>
      <div className="material-card__content">
        <h3 className="material-card__title">{title}</h3>
        {description && <p className="material-card__description">{description}</p>}
      </div>
      <span className="material-card__badge">{badge}</span>
    </Link>
  );
}

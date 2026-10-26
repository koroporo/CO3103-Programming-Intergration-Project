const SKILLS = ['listening', 'reading', 'writing', 'speaking'];
const BANDS = Array.from({ length: 13 }, (_, index) => (3 + index * 0.5).toFixed(1));

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function CourseFilter({ skill, band, onChange }) {
  return (
    <div>
      <select
        aria-label="Filter by skill"
        value={skill}
        onChange={(event) => onChange('skill', event.target.value)}
      >
        <option value="">All skills</option>
        {SKILLS.map((item) => (
          <option key={item} value={item}>
            {capitalize(item)}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by band"
        value={band}
        disabled={!skill}
        onChange={(event) => onChange('band', event.target.value)}
      >
        <option value="">All bands</option>
        {BANDS.map((item) => (
          <option key={item} value={item}>
            Band {item}
          </option>
        ))}
      </select>
    </div>
  );
}
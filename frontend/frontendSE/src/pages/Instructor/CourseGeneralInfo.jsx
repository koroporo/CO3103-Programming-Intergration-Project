import { useState } from "react";
import "./CourseGeneralInfo.css";
import Header from "../../components/Homepage/Header";

function CourseGeneralInfo() {
  const [courseName, setCourseName] = useState(
    "IELTS Academic Mastery: Band 7.5 Intensive Program"
  );

  const [description, setDescription] = useState("fr");

  const [duration, setDuration] = useState(
    "8 weeks (24 sessions, 90 min each)"
  );

  const [prerequisites, setPrerequisites] = useState(
    `• Minimum English level: Intermediate (B1) or above
• Recommended prior score: IELTS 5.5–6.0 or equivalent
• A working microphone for speaking practice sessions
• Commitment of 6–8 hours/week (class + homework)`
  );

  const [tags, setTags] = useState(["IELTS Academic"]);

  // Structured prerequisite skills
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]);

  const [newPrerequisite, setNewPrerequisite] = useState(null);

  const skills = [
    "Listening",
    "Reading",
    "Writing",
    "Speaking",
  ];

  const bands = [
    "1.0",
    "2.0",
    "3.0",
    "4.0",
    "4.5",
    "5.0",
    "5.5",
    "6.0",
    "6.5",
    "7.0",
    "7.5",
    "8.0",
  ];

  const handleAddCategory = () => {
    const category = window.prompt("Enter a category:");

    if (category && category.trim()) {
      setTags([...tags, category.trim()]);
    }
  };

  // Add a temporary prerequisite row
  const handleAddPrerequisite = () => {
    // Prevent multiple unsaved rows
    if (newPrerequisite) {
      return;
    }

    setNewPrerequisite({
      skill: "",
      band: "",
    });
  };

  const handleSkillChange = (e) => {
    setNewPrerequisite({
      ...newPrerequisite,
      skill: e.target.value,
    });
  };

  const handleBandChange = (e) => {
    setNewPrerequisite({
      ...newPrerequisite,
      band: e.target.value,
    });
  };

  // Save the temporary prerequisite
  const handleSavePrerequisite = () => {
    if (!newPrerequisite.skill || !newPrerequisite.band) {
      window.alert("Please select both a skill and a band.");
      return;
    }

    setPrerequisiteSkills([
      ...prerequisiteSkills,
      newPrerequisite,
    ]);

    setNewPrerequisite(null);
  };

  // Delete the temporary prerequisite row
  const handleDeletePrerequisite = () => {
    setNewPrerequisite(null);
  };

  // Delete an already-saved prerequisite
  const handleDeleteSavedPrerequisite = (index) => {
    setPrerequisiteSkills(
      prerequisiteSkills.filter((_, i) => i !== index)
    );
  };

  const handleDone = () => {
    const courseData = {
      title: courseName,
      description,
      duration,
      tags,
      prerequisite_text: prerequisites,

      // Structured prerequisite data
      prerequisite_skills: prerequisiteSkills,
    };

    console.log("Course data:", courseData);

    /*
      Example:

      prerequisite_skills: [
        {
          skill: "Speaking",
          band: "5.5"
        },
        {
          skill: "Listening",
          band: "5.0"
        }
      ]

      Later send courseData to your backend API.
    */
  };

  return (
    <div className="course-page">
      <Header />

      <div className="course-editor">

        <div className="course-form">

          {/* Top section */}
          <div className="course-top">

            {/* Cover */}
            <div className="cover-container">
              <img
                src="/images/course-cover.jpg"
                alt="Course cover"
                className="course-cover"
              />

              <div className="upload-overlay">
                Upload Cover
              </div>
            </div>

            {/* Course information */}
            <div className="basic-info">

              {/* Course name */}
              <div className="form-group">
                <label>Course Name</label>

                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              {/* Instructor */}
              <div className="instructor">
                <span className="instructor-dot"></span>
                <span>Sarah Thompson</span>
              </div>

              {/* Description */}
              <div className="form-group description-group">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Duration */}
          <div className="duration-group">
            <label>Duration:</label>

            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="section">
            <h3>Tag</h3>

            <div className="tags">

              {tags.map((tag, index) => (
                <span className="tag" key={index}>
                  {tag}
                </span>
              ))}

              <span className="rating">
                <span className="stars">★★★★★</span>
                <span>4.8</span>
              </span>

              <button
                type="button"
                className="add-category"
                onClick={handleAddCategory}
              >
                + Add category
              </button>

            </div>
          </div>

          {/* Prerequisites text */}
          <div className="section">
            <h3>Prerequisites</h3>

            <textarea
              className="prerequisites"
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
            />
          </div>


          {/* ========================================= */}
          {/* Prerequisite Skills */}
          {/* ========================================= */}

          <div className="section prerequisite-skills-section">

            <h3>Prerequisite skills</h3>

            {/* Saved prerequisite tags */}
            <div className="prerequisite-tags">

              {prerequisiteSkills.map((item, index) => (
                <div
                  className="prerequisite-tag"
                  key={index}
                >
                  <span>
                    {item.skill} ≥ {item.band}
                  </span>

                  <button
                    type="button"
                    className="remove-prerequisite"
                    onClick={() =>
                      handleDeleteSavedPrerequisite(index)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}

            </div>


            {/* Temporary add row */}
            {newPrerequisite && (
              <div className="prerequisite-row">

                {/* Skill dropdown */}
                <select
                  value={newPrerequisite.skill}
                  onChange={handleSkillChange}
                >
                  <option value="">
                    Select skill
                  </option>

                  {skills.map((skill) => (
                    <option
                      key={skill}
                      value={skill}
                    >
                      {skill}
                    </option>
                  ))}
                </select>


                {/* Band dropdown */}
                <select
                  value={newPrerequisite.band}
                  onChange={handleBandChange}
                >
                  <option value="">
                    Select band
                  </option>

                  {bands.map((band) => (
                    <option
                      key={band}
                      value={band}
                    >
                      Band {band}
                    </option>
                  ))}
                </select>


                {/* Save */}
                <button
                  type="button"
                  className="save-prerequisite"
                  onClick={handleSavePrerequisite}
                >
                  Save
                </button>


                {/* Delete */}
                <button
                  type="button"
                  className="delete-prerequisite"
                  onClick={handleDeletePrerequisite}
                >
                  Delete
                </button>

              </div>
            )}


            {/* Add prerequisite */}
            <button
              type="button"
              className="add-prerequisite"
              onClick={handleAddPrerequisite}
            >
              + Add prerequisite
            </button>

          </div>

        </div>


        {/* Done */}
        <button
          type="button"
          className="done-button"
          onClick={handleDone}
        >
          Done
        </button>

      </div>
    </div>
  );
}

export default CourseGeneralInfo;
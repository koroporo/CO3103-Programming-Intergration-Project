import { useState } from "react";
import "./CourseGeneralInfo.css";
import Header from "../../components/Homepage/Header";

function CourseGeneralInfo() {
  const [courseName, setCourseName] = useState(
    "IELTS Academic Mastery: Band 7.5 Intensive Program"
  );

  const [description, setDescription] = useState(
    "An intensive IELTS Academic course designed to help learners improve their IELTS performance."
  );

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

  // Prerequisite skills
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]);
  const [newPrerequisite, setNewPrerequisite] = useState(null);

  // Expected output skills
  const [expectedOutputSkills, setExpectedOutputSkills] = useState([]);
  const [newExpectedOutput, setNewExpectedOutput] = useState(null);

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

  // =========================================================
  // Category / Tags
  // =========================================================

  const handleAddCategory = () => {
    const category = window.prompt("Enter a category:");

    if (category && category.trim()) {
      setTags([...tags, category.trim()]);
    }
  };

  const handleDeleteTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // =========================================================
  // Prerequisite Skills
  // =========================================================

  const handleAddPrerequisite = () => {
    if (newPrerequisite) return;

    setNewPrerequisite({
      skill: "",
      band: "",
    });
  };

  const handlePrerequisiteSkillChange = (e) => {
    setNewPrerequisite({
      ...newPrerequisite,
      skill: e.target.value,
    });
  };

  const handlePrerequisiteBandChange = (e) => {
    setNewPrerequisite({
      ...newPrerequisite,
      band: e.target.value,
    });
  };

  const handleSavePrerequisite = () => {
    if (
      !newPrerequisite.skill ||
      !newPrerequisite.band
    ) {
      window.alert(
        "Please select both a skill and a band."
      );
      return;
    }

    setPrerequisiteSkills([
      ...prerequisiteSkills,
      newPrerequisite,
    ]);

    setNewPrerequisite(null);
  };

  const handleCancelPrerequisite = () => {
    setNewPrerequisite(null);
  };

  const handleDeleteSavedPrerequisite = (index) => {
    setPrerequisiteSkills(
      prerequisiteSkills.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // Expected Output Skills
  // =========================================================

  const handleAddExpectedOutput = () => {
    if (newExpectedOutput) return;

    setNewExpectedOutput({
      skill: "",
      band: "",
    });
  };

  const handleExpectedOutputSkillChange = (e) => {
    setNewExpectedOutput({
      ...newExpectedOutput,
      skill: e.target.value,
    });
  };

  const handleExpectedOutputBandChange = (e) => {
    setNewExpectedOutput({
      ...newExpectedOutput,
      band: e.target.value,
    });
  };

  const handleSaveExpectedOutput = () => {
    if (
      !newExpectedOutput.skill ||
      !newExpectedOutput.band
    ) {
      window.alert(
        "Please select both a skill and a band."
      );
      return;
    }

    setExpectedOutputSkills([
      ...expectedOutputSkills,
      newExpectedOutput,
    ]);

    setNewExpectedOutput(null);
  };

  const handleCancelExpectedOutput = () => {
    setNewExpectedOutput(null);
  };

  const handleDeleteExpectedOutput = (index) => {
    setExpectedOutputSkills(
      expectedOutputSkills.filter(
        (_, i) => i !== index
      )
    );
  };

  // =========================================================
  // Create Course
  // =========================================================

  const handleDone = async () => {
    try {
      const token = localStorage.getItem("token");

      const courseData = {
        category_id: 1,

        title: courseName,

        description,

        //duration,

        //tags,

        prerequisite_text: prerequisites,

        // Goes to course_prerequisites
        prerequisite_skills: prerequisiteSkills,

        // Goes to course_skills
        expected_output_skills:
          expectedOutputSkills,
      };

      console.log(
        "Sending course data:",
        courseData
      );

      const response = await fetch(
        "http://localhost:3000/courses",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify(courseData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create course."
        );
      }

      console.log(
        "Course created:",
        result
      );

      window.alert(
        "Course created successfully!"
      );
    } catch (error) {
      console.error(
        "Create course error:",
        error
      );

      window.alert(
        error.message ||
          "Failed to create course."
      );
    }
  };

  return (
    <div className="course-general-page">
      <Header />

      <main className="course-general-container">

        <div className="page-header">
          <div>
            <h1>
              Course General Information
            </h1>

            <p>
              Provide the basic information
              about your course.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* Course Name */}
        {/* ================================================= */}

        <div className="form-section">
          <label>Course Name</label>

          <input
            type="text"
            value={courseName}
            onChange={(e) =>
              setCourseName(e.target.value)
            }
            placeholder="Enter course name"
          />
        </div>

        {/* ================================================= */}
        {/* Course Cover */}
        {/* ================================================= */}

        <div className="form-section">
          <label>Course Cover</label>

          <div className="cover-box">
            <div className="cover-placeholder">
              Course Cover
            </div>

            <button type="button">
              Upload Cover
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* Instructor */}
        {/* ================================================= */}

        <div className="form-section">
          <label>Instructor</label>

          <div className="instructor-box">
            <div className="instructor-avatar">
              I
            </div>

            <div>
              <div className="instructor-name">
                Current Instructor
              </div>

              <div className="instructor-role">
                Instructor
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* Description */}
        {/* ================================================= */}

        <div className="form-section">
          <label>
            Course Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={5}
            placeholder="Describe your course"
          />
        </div>

        {/* ================================================= */}
        {/* Duration */}
        {/* ================================================= */}

        <div className="form-section">
          <label>Duration</label>

          <input
            type="text"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            placeholder="Example: 8 weeks"
          />
        </div>

        {/* ================================================= */}
        {/* Tags */}
        {/* ================================================= */}

        <div className="form-section">
          <label>
            Category / Tags
          </label>

          <div className="tag-list">
            {tags.map((tag, index) => (
              <div
                className="tag"
                key={index}
              >
                <span>{tag}</span>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTag(index)
                  }
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              className="add-button"
              onClick={handleAddCategory}
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* Text Prerequisites */}
        {/* ================================================= */}

        <div className="form-section">
          <label>
            Prerequisites
          </label>

          <textarea
            value={prerequisites}
            onChange={(e) =>
              setPrerequisites(
                e.target.value
              )
            }
            rows={6}
            placeholder="Describe the requirements for learners"
          />
        </div>

        {/* ================================================= */}
        {/* Prerequisite Skills */}
        {/* ================================================= */}

        <div className="form-section">
          <label>
            Prerequisite Skills
          </label>

          <p className="section-description">
            Skills and minimum IELTS band
            required before taking this course.
          </p>

          <div className="skill-list">
            {prerequisiteSkills.map(
              (item, index) => (
                <div
                  className="skill-row"
                  key={index}
                >
                  <div>
                    <span className="skill-name">
                      {item.skill}
                    </span>

                    <span className="skill-band">
                      Minimum Band{" "}
                      {item.band}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDeleteSavedPrerequisite(
                        index
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )
            )}
          </div>

          {newPrerequisite ? (
            <div className="skill-editor">

              <select
                value={
                  newPrerequisite.skill
                }
                onChange={
                  handlePrerequisiteSkillChange
                }
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

              <select
                value={
                  newPrerequisite.band
                }
                onChange={
                  handlePrerequisiteBandChange
                }
              >
                <option value="">
                  Select minimum band
                </option>

                {bands.map((band) => (
                  <option
                    key={band}
                    value={band}
                  >
                    {band}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="save-button"
                onClick={
                  handleSavePrerequisite
                }
              >
                Save
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  handleCancelPrerequisite
                }
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-skill-button"
              onClick={
                handleAddPrerequisite
              }
            >
              + Add Prerequisite Skill
            </button>
          )}
        </div>

        {/* ================================================= */}
        {/* Expected Output */}
        {/* ================================================= */}

        <div className="form-section">
          <label>
            Expected Output
          </label>

          <p className="section-description">
            Skills and target IELTS band
            learners are expected to achieve
            after completing this course.
          </p>

          <div className="skill-list">
            {expectedOutputSkills.map(
              (item, index) => (
                <div
                  className="skill-row"
                  key={index}
                >
                  <div>
                    <span className="skill-name">
                      {item.skill}
                    </span>

                    <span className="skill-band">
                      Target Band{" "}
                      {item.band}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDeleteExpectedOutput(
                        index
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              )
            )}
          </div>

          {newExpectedOutput ? (
            <div className="skill-editor">

              <select
                value={
                  newExpectedOutput.skill
                }
                onChange={
                  handleExpectedOutputSkillChange
                }
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

              <select
                value={
                  newExpectedOutput.band
                }
                onChange={
                  handleExpectedOutputBandChange
                }
              >
                <option value="">
                  Select target band
                </option>

                {bands.map((band) => (
                  <option
                    key={band}
                    value={band}
                  >
                    {band}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="save-button"
                onClick={
                  handleSaveExpectedOutput
                }
              >
                Save
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  handleCancelExpectedOutput
                }
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-skill-button"
              onClick={
                handleAddExpectedOutput
              }
            >
              + Add Expected Output
            </button>
          )}
        </div>

        {/* ================================================= */}
        {/* Bottom Actions */}
        {/* ================================================= */}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-main-button"
          >
            Cancel
          </button>

          <button
            type="button"
            className="done-button"
            onClick={handleDone}
          >
            Done
          </button>
        </div>

      </main>
    </div>
  );
}

export default CourseGeneralInfo;
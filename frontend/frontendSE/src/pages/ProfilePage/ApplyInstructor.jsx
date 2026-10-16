import  { useState } from "react";
import "./ApplyInstructor.css";
// Giữ nguyên import hàm gửi API của bạn
import { sendInstructorApplication } from "../../services/sendInstructorApplication";

export default function ApplyInstructor() {
    // Các state quản lý form
    const [description, setDescription] = useState("");
    //const [experience, setExperience] = useState("");
    //const [targetScore, setTargetScore] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Xử lý khi chọn file
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Xử lý submit
    async function sendApplication() {
        // Tạm thời vẫn dùng hàm cũ của bạn truyền description
        // Sau này bạn có thể cập nhật API để nhận thêm file, experience, targetScore
        await sendInstructorApplication(description);
        alert("Application submitted successfully!");
    }

    return (
        <div className="apply-page-wrapper">
            <div className="apply-card">
                
                {/* TIÊU ĐỀ & MÔ TẢ */}
                <div className="apply-header">
                    <h1>Become an IELTS Instructor</h1>
                    <p>Join our team and help students achieve their IELTS goals.<br/>Please tell us about yourself.</p>
                </div>

                <div className="apply-form">
                    {/* 1. BIOGRAPHY */}
                    <div className="form-group">
                        <label>Tell us about yourself / Biography</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Introduce yourself, your experience, and why you want to join us..."
                            rows="4"
                        ></textarea>
                    </div>

                    {/* 2. UPLOAD CV */}
                    <div className="form-group">
                        <label>Upload CV / Certificates (PDF)</label>
                        <div className="upload-box">
                            <div className="upload-icon-left">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
                            </div>
                            
                            <label className="browse-btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                Browse Files
                                <input type="file" accept=".pdf" onChange={handleFileChange} hidden />
                            </label>
                        </div>
                        {selectedFile && <span className="file-name-selected">Selected: {selectedFile.name}</span>}
                        <span className="helper-text">Please upload your CV and IELTS certificate (8.0+ preferred)</span>
                    </div>

                    {/* 3. TEACHING EXPERIENCE */}
                    {/* <div className="form-group">
                        <label>Teaching Experience</label>
                        <div className="checkbox-group">
                            <label className="checkbox-item">
                                <input type="radio" name="experience" value="No experience" onChange={(e) => setExperience(e.target.value)} />
                                <span>No experience</span>
                            </label>
                            <label className="checkbox-item">
                                <input type="radio" name="experience" value="Under 1 year" onChange={(e) => setExperience(e.target.value)} />
                                <span>Under 1 year</span>
                            </label>
                            <label className="checkbox-item">
                                <input type="radio" name="experience" value="1-3 years" onChange={(e) => setExperience(e.target.value)} />
                                <span>1-3 years</span>
                            </label>
                            <label className="checkbox-item">
                                <input type="radio" name="experience" value="Over 3 years" onChange={(e) => setExperience(e.target.value)} />
                                <span>Over 3 years</span>
                            </label>
                        </div>
                    </div> */}

                    {/* 4. TARGET SCORE */}
                    {/* <div className="form-group">
                        <label>Target IELTS Score</label>
                        <div className="input-with-icon">
                            <input 
                                type="text" 
                                value={targetScore}
                                onChange={(e) => setTargetScore(e.target.value)}
                                placeholder="Your IELTS Overall Band" 
                            />
                            <div className="input-icons">
                                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 9 12 5 16 9"></polyline><polyline points="16 15 12 19 8 15"></polyline></svg>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </div>
                        </div>
                    </div> */}

                    {/* BUTTONS */}
                    <div className="form-actions">
                        <button className="submit-btn" onClick={sendApplication}>Submit Application</button>
                        <button className="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
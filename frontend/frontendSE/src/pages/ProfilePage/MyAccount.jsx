//import React from "react";
import "./MyAccount.css";
import myAvatar from "../../assets/avt.jpg";

export default function MyAccount()
{
    /* const [user, setUser] = useState(null);
    useEffect(() => {
    async function getUser() {
        const response = await fetch("http://localhost:3000/api/auth/me", {
            credentials: "include"
        });

        const data = await response.json();

        setUser(data);
    }

    getUser();
}, []); */
    const userInfo = {
        name: "Trần Hoàng Phúc",
        role: "Learner",
        phone: "0353580918",
        sex: "Male",
        birthday: "09/08/2006",
        school: "Ho Chi Minh City University Of Technology"
    };
    
    return (
        <div className="account-page-wrapper">
            <div className="account-card">
                
                {/* ---------- CỘT TRÁI: AVATAR & STATUS ---------- */}
                <div className="account-sidebar">
                    <img src={myAvatar} alt="User Avatar" className="large-avatar" />
                    
                    <button className="change-avatar-btn">Change Avatar</button>
                    
                    <div className="status-container">
                        <span className="status-dot"></span>
                        <span className="status-text">Online</span>
                    </div>
                </div>

                {/* ---------- CỘT PHẢI: THÔNG TIN CHI TIẾT ---------- */}
                <div className="account-content">
                    <h1 className="account-header">My Account</h1>
                    
                    <div className="info-grid">
                        {/* 1. Name */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">NAME</span>
                                <span className="info-value">{userInfo.name}</span>
                            </div>
                        </div>

                        {/* 2. Role */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">ROLE</span>
                                <span className="info-value role-badge">{userInfo.role}</span>
                            </div>
                        </div>

                        {/* 3. Phone Number */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">PHONE NUMBER</span>
                                <span className="info-value">{userInfo.phone}</span>
                            </div>
                        </div>

                        {/* 4. Sex */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"></circle><line x1="13.54" y1="10.46" x2="21" y2="3"></line><line x1="16" y1="3" x2="21" y2="3"></line><line x1="21" y1="3" x2="21" y2="8"></line></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">SEX</span>
                                <span className="info-value">{userInfo.sex}</span>
                            </div>
                        </div>

                        {/* 5. Birthday */}
                        <div className="info-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">BIRTHDAY</span>
                                <span className="info-value">{userInfo.birthday}</span>
                            </div>
                        </div>

                        {/* 6. School */}
                        <div className="info-box school-box">
                            <div className="icon-wrapper">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                            </div>
                            <div className="info-text">
                                <span className="info-label">SCHOOL</span>
                                <span className="info-value">{userInfo.school}</span>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";
import {
    getPendingApplications,
    reviewApplication,
} from "../../services/adminApplications";

export default function AdminBoard() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notes, setNotes] = useState({});

    useEffect(function () {
        async function loadApplications() {
            try {
                const list = await getPendingApplications();
                setApplications(list);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadApplications();
    }, []);

    function handleNoteChange(id, text) {
        const newNotes = { ...notes };
        newNotes[id] = text;
        setNotes(newNotes);
    }

    async function handleReview(id, decision) {
        try {
            const note = notes[id] || "";
            await reviewApplication(id, decision, note);
            const remaining = applications.filter(function (application) {
                return application.id !== id;
            });
            setApplications(remaining);
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Instructor Requests</h1>

            {error !== "" && <p style={{ color: "red" }}>{error}</p>}

            {applications.length === 0 && <p>No pending applications.</p>}

            {applications.map(function (app) {
                const applicantName = app.full_name || "#" + app.applicant_id;
                const submittedTime = new Date(app.submitted_at).toLocaleString();

                return (
                    <div
                        key={app.id}
                        style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
                    >
                        <p><b>Applicant:</b> {applicantName}</p>
                        <p><b>Requested role:</b> {app.requested_role}</p>
                        <p><b>Submitted:</b> {submittedTime}</p>
                        <p><b>Description:</b> {app.application_text}</p>

                        <p>
                            <b>Evidence:</b>{" "}
                            {app.evidence_url ? (
                                <a href={app.evidence_url} target="_blank" rel="noreferrer">
                                    {app.evidence_url}
                                </a>
                            ) : (
                                "None"
                            )}
                        </p>

                        <input
                            type="text"
                            placeholder="Review note (optional)"
                            value={notes[app.id] || ""}
                            onChange={function (e) {
                                handleNoteChange(app.id, e.target.value);
                            }}
                        />

                        <button onClick={function () { handleReview(app.id, "accept"); }}>
                            Accept
                        </button>
                        <button onClick={function () { handleReview(app.id, "reject"); }}>
                            Reject
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
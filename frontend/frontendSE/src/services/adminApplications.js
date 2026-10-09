const BASE_URL = "http://localhost:3000/role-applications";

// true  = use mock data (when the backend is not ready)
// false = call the real API
const USE_MOCK = false;

// Mock data for testing the UI
const mockData = [
    {
        id: 1,
        applicant_id: 10,
        full_name: "Nguyen Van A",
        requested_role: "instructor",
        application_text: "Tôi có IELTS 8.0, dạy 3 năm.",
        evidence_url: "https://example.com/cert1",
        status: "pending",
        submitted_at: "2026-10-07T08:00:00Z",
    },
    {
        id: 2,
        applicant_id: 11,
        full_name: "Tran Thi B",
        requested_role: "instructor",
        application_text: "Tôi muốn chia sẻ kinh nghiệm luyện Writing.",
        evidence_url: null,
        status: "pending",
        submitted_at: "2026-10-07T09:30:00Z",
    },
];

// Read the backend response; throw an error if the request failed
async function readResponse(response, defaultErrorMessage) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || defaultErrorMessage);
    }

    return data;
}

// Get applications waiting for review (status = pending)
export async function getPendingApplications() {
    if (USE_MOCK) {
        const pendingList = mockData.filter(function (application) {
            return application.status === "pending";
        });
        return pendingList;
    }

    const response = await fetch(BASE_URL + "?status=pending", {
        credentials: "include",
    });
    return readResponse(response, "Failed to load applications");
}

// Review one application. decision is "accept" or "reject"
export async function reviewApplication(id, decision, reviewNote) {
    if (USE_MOCK) {
        const application = mockData.find(function (item) {
            return item.id === id;
        });

        if (decision === "accept") {
            application.status = "approved";
        } else {
            application.status = "rejected";
        }

        return { message: "ok" };
    }

    const response = await fetch(BASE_URL + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            decision: decision,
            review_note: reviewNote,
        }),
    });
    return readResponse(response, "Failed to review application");
}
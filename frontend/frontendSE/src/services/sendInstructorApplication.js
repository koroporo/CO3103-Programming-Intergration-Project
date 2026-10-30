export async function sendInstructorApplication(description) {
    const response = await fetch(
        "/api/role-applications",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include", // Required for cross-origin cookies
            body: JSON.stringify({
                application_text: description
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to send application");
    }

    return data;
}
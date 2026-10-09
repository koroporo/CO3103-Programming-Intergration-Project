export async function sendInstructorApplication(description) {
    const response = await fetch("http://localhost:3000/role-applications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            application_text: description
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to send application");
    }

    return data;
}


const API_URL = "http://localhost:3000/auth";

export async function sendResetRequest(email)
{
    const response = await fetch(`${API_URL}/forgot-password`,{
        method:"POST",
        headers:{
            "Content-type": "application/json"
        },
        credentials:"include",
        body: JSON.stringify({email})
    });

    const data = await response.json();

    if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
const API_URL = "http://localhost:3000/api/auth/register";

export async function register(email, password, fullname) {
 const response = await fetch(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullname,
        }),
      }
    )
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Regisration failed");
  }

  return data;
}

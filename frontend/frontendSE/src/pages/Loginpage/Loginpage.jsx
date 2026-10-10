import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { login } from '../../services/login';
import { useState } from 'react';
import { useAuth } from '../../hooks/Authentication/useAuth';

export default function LoginPage() {
const [email, setEmail] = useState("")
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const navigate = useNavigate();
const { loginUser } = useAuth();

async function handleSubmit(event) {
event.preventDefault();
setError("");

try {
  const data = await login(email, password);

  loginUser(data.user); // Update shared React state
  console.log("Logged in user:", data.user);
  navigate("/");
} catch (err) {
  setError(err.message);
}

}

return (
<form onSubmit={handleSubmit}>
<h1>Log In</h1>

  <input
    type="email"
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    placeholder="Email"
    required
  />

  <input
    type="password"
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    placeholder="Password"
    required
  />

  <button type="submit">Log In</button>

  {error && <p>{error}</p>}
</form>
)};
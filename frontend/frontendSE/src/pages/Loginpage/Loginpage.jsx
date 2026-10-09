import './LoginPage.css';

export default function LoginPage() {
return ( <div className="login-page"> <form className="login-form"> <h1>Log In</h1>

```
    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      placeholder="Enter your email"
      required
    />

    <label htmlFor="password">Password</label>
    <input
      id="password"
      type="password"
      placeholder="Enter your password"
      required
    />

    <button type="submit">Log In</button>
  </form>
</div>
);
}

//import { useState,useEffect } from "react";
export default function MyAccount()
{
    /* const [user, setUser] = useState(null);
    useEffect(() => {
    async function getUser() {
        const response = await fetch("http://localhost:3000/auth/me", {
            credentials: "include"
        });

        const data = await response.json();

        setUser(data);
    }

    getUser();
}, []); */
    
    
    return(
        <div className="account-container">
            <span><strong>Name</strong><p>Name go here</p></span>
            <span><strong>Role</strong><p>Role go here</p></span>
            {/** avatar_url" text,
  "bio" text,
  "target_overall_band" numeric(3,1),
  "target_exam_date" date,
  "status" varchar(20) NOT NULL,
  "created_at" timestamptz NOT NULL, */}
        </div>
    )
}
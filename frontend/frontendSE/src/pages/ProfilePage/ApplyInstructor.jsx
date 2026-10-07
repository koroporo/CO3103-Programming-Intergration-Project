import { useState } from "react"
import { sendInstructorApplication } from "../../services/sendInstructorApplication";

export default function ApplyInstructor()
{
    const [description, setDescription] = useState("");
    async function sendApplication() {
    await sendInstructorApplication(description);
    }

    return(
        <div>
            <h1>I want to be an instructor</h1>
            <p>Please descibe yourself</p>
            <input type="text" onChange={(e)=>(setDescription(e.target.value))} value={description} placeholder="type in here"
            ></input>
            <button onClick={sendApplication}>SEND</button>
            
        </div>
    )
}
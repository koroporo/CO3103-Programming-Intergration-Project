export default function History()
{
    /**
     * const [ courses, setCourses ] = useState(null)
     * useEffect(()=>{
     * async function getHistory()
     * {
     * const response = await ...
     * const data = await respone.json();
     * setCourse(data);
     * }
     * },[])
     *  
     * 
     * } 
     */
    return(
        <div className="history-container">
        <h1>History</h1>
        <p>A list of attemps goes here</p>
            <div className="history-card">
            <p>Tilte - Mark - Time stamp - View more details</p>
            </div>
        {
            /**
             *  courses.map((course)=>
             * <div>
             * enrollment_id -> title
             * Time start: course.started_at
             * Last for: course.submitted_at - started_at
             * Score: course.score/course.max_points
             * Pass: course.is_passed
             * View more details -> <button onClick=viewDetailHistoryAttemp></button>
             * </div>
             * )
             */
        }
        </div>
    )
}
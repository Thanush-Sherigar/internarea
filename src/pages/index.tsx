import JobCard from "../components/JobCard";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {useEffect,useState} from "react";
import axios from "axios";
export default function Home() {
  const[jobs,setJobs]=useState([]);
  useEffect(()=>{
const fetchJobs=async()=>{
  try{
    const response=await axios.get('http://localhost:5000/api/internship');
    setJobs(response.data);
  }catch(error){
    console.log("Error fetcahing jobs:",error);
  }
  };
  fetchJobs();
  },[]);
  return (
      <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold mb-8">Latest Internships</h2>
        
        {/* We are reusing the JobCard component 3 times */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job:any)=>(
            <JobCard 
            key={job._id}
            jobId={job._id}
            title={job.title}
            company={job.company}
            location={job.location}
            stipend={job.stipend}
            />
          ))}
          </div>
      </main>
      <Footer />
    </div>
  );
}

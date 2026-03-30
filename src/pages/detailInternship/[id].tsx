import {useRouter} from 'next/router';
import {useEffect,useState} from 'react';
import axios from 'axios';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
export default function InternshipDetail(){
const router=useRouter();
const {id}=router.query;
const[internship,setInternship]=useState<any>(null);
useEffect(()=>{
    if(!id)return;
    const fetchDetails=async()=>{
        const res=await axios.get(`http://localhost:5000/api/internship/${id}`);
        setInternship(res.data);
    };
    fetchDetails()
},[id]);
if(!internship) return <p>Nope</p>;
return(
    <div>
        <NavBar/>
        <div className="max-w-4xl mx-auto text-black p-10 bg-white shadow-lg mt-10 rounded-lg">
            <h1 className="text-4xl font-bold">{internship.title}</h1>
            <p className="text-xl text-blue-600 mt-2">{internship.company}</p>
            <hr className="my-6"/>
            <div className="grid grid-cols-2gap4">
                <p><strong>Location :${internship.location}</strong></p>
                <p><strong>Stipend :${internship.stipend}</strong></p>
            </div>
            <button className="mt-10 bg-blue-500text-white border border-blue-500 px-8 py-3 rounded-md font-bold hover:bg-blue-600">
                Apply Now
            </button>
        </div>
        <Footer/>
        </div>
)
}
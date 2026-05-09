import {useState,useEffect} from 'react';
import { useSelector} from 'react-redux';
import {useRouter} from 'next/router';
import { RootState } from '../../store/store';
import NavBar from '../../components/NavBar';
import axios from 'axios';
const PostInternship=()=>{
    const {isLoggedIn,userInfo,loading}=useSelector((state: RootState)=>state.user);
    const router=useRouter();
    const[formData,setFormData]=useState({
        title:'',
        company:'',
        location:'',
        stipend:''
    });
    useEffect(()=>{
        if(!loading){
        if(!isLoggedIn||userInfo?.email!=='thanush53@gmail.com'){
            console.log(userInfo?.email);
            router.push('/');
        }
        }
    },[isLoggedIn,userInfo,router]);
const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    try{
        await axios.post('http://localhost:5000/api/internship',formData);
        alert("InterShip Posted Successfully!");
        router.push('/');
    }catch(err){
        console.error(err);
    }
};
return (
        <div>
            <NavBar />
            <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
                <h1 className="text-2xl font-bold mb-6">Post a New Internship</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        className="w-full p-3 border rounded"
                        placeholder="Job Title (e.g. React Developer)"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                    <input 
                        className="w-full p-3 border rounded"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        required
                    />
                    <input 
                        className="w-full p-3 border rounded"
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        required
                    />
                    <input 
                        className="w-full p-3 border rounded"
                        placeholder="stipend"
                        value={formData.stipend}
                        onChange={(e) => setFormData({...formData, stipend: e.target.value})}
                    />
                    {/* Add inputs for location and stipend similarly */}
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
                        Create Posting
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostInternship;
// src/Components/JobCard.tsx
import React from 'react';
import Link from 'next/link';
// Interview Focus: Defining an Interface (TypeScript)
// This ensures every JobCard receives the correct data types.
interface JobProps {
  jobId: string; // Unique identifier for the internship
  title: string;
  company: string;
  location: string;
  stipend: string;
}

const JobCard: React.FC<JobProps> = ({jobId, title, company, location, stipend }) => {
  return (
    <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="to-blue-500">{company}</p>
      <div className="mt-4 text-sm text-gray-500">
        <p>📍 {location}</p>
        <p>ID: {jobId}</p>
        <p>💰 {stipend}</p>
      </div>
      <Link href={`/detailInternship/${jobId}`} passHref>
      <button className="w-full mt-4 py-2 border border-blue-500 text-blue-500 font-semibold rounded hover:bg-blue-500 hover:text-white transition">
        View Details
      </button>
      </Link>
    </div>
  );
};

export default JobCard;
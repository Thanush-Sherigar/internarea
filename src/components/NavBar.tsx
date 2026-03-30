// src/Components/JobCard.tsx
import React from 'react';

const NavBar :React.FC= () => {
  return (
    <nav className="navbar bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-blue-500">Internshala</div>
          <ul className="flex space-x-4">
            <li><a href="#" className="text-gray-600 hover:text-blue-500">Internships</a></li>
            <li><a href="#" className="text-gray-600 hover:text-blue-500">Jobs</a></li>
            <li><button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Login</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
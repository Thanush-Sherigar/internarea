import React from 'react';
const Footer: React.FC= () =>{
return (
    <footer className="p-8 bg-gray-900 text-white text-center mt-10">
      <p>&copy; 2026 Internshala Clone. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <a href="#" className="hover:text-blue-400">About Us</a>
        <a href="#" className="hover:text-blue-400">Help Center</a>
      </div>
    </footer>
)
}
export default Footer;
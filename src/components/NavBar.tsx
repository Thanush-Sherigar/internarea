import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { login, logout } from "../Feature/UserSlice";
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
const NavBar = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);
  // Inside your component:
  useEffect(() => {
    // This function runs every time the app loads
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If Firebase finds a saved session, refill the Redux Cabinet
        dispatch(login({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL
        }));
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [dispatch]);
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      dispatch(login({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL
      }));

      toast.success("Welcome back!");
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        alert('Cancelled popup request. Please try again.');
      } else if (error.code === 'auth/configuration-not-found') {
        alert('Firebase Auth is not configured correctly.');
      } else {
        alert('Login failed: ' + (error.message || 'Unknown error'));
      }
      console.error('Login error:', error);
    }
  };
  return (
    <nav className="navbar bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-blue-500">Internshala</div>
          <ul className="flex space-x-4">
            <li><a href="/" className="text-gray-600 hover:text-blue-500">Internships</a></li>
            <li><a href="/" className="text-gray-600 hover:text-blue-500">Jobs</a></li>
            <li><a href="/public-space" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Public Space</a></li>
            <li><a href="/pricing" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Pricing</a></li>
            <li><a href="/resume-builder" className="text-gray-600 hover:text-blue-500 font-semibold text-blue-600">Resume Builder</a></li>
            <div>
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <img src={userInfo.photo} alt="User" className="w-8 h-8 rounded-full" />
                  <span>{userInfo.name}</span>
                  <button
                    onClick={() => dispatch(logout())}
                    className="text-red-500 border border-red-500 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <a href="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">Forgot Password?</a>
                  <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Login with Google
                  </button>
                </div>
              )}
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default NavBar;
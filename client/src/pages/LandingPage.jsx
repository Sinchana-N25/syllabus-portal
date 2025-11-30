import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LandingPage = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2", // This forces Google Login directly
      },
    });
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Left Side - Catchy Content */}
      <div className="w-1/2 flex flex-col justify-center px-16 bg-gradient-to-br from-blue-600 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

        <h1 className="text-5xl font-bold mb-6 relative z-10 leading-tight">
          Streamline Your <br /> Course Curriculum.
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-md relative z-10">
          The ultimate portal for teachers to manage, organize, and distribute
          syllabus details with ease.
        </p>
        <div className="text-sm font-mono bg-blue-800/30 p-4 rounded-lg backdrop-blur-sm border border-blue-400/30 w-fit">
          <span className="text-green-400">✔</span> CSE Dept{" "}
          {/* CHANGED THIS */}
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white relative">
        <div className="max-w-md w-full px-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-500 mb-8">
            Please sign in to access your dashboard.
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 p-4 rounded-xl hover:bg-slate-50 transition-all hover:border-blue-500 group"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-6 h-6"
              alt="Google Logo"
            />
            <span className="font-semibold text-slate-700 group-hover:text-blue-600">
              Continue with Google
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

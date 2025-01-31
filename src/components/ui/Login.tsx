import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../../lib/firebase";
import { FaGoogle, FaGithub,FaBible } from "react-icons/fa";

const Login: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google", error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("Error al iniciar sesión con GitHub", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-green-100">
      <div className="bg-white shadow-2xl rounded-3xl p-14 w-[600px] text-center border border-green-300">
         <FaBible className="text-green-800 text-6xl mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-green-700 mb-8">Biblia Reina Valera</h2>
        <p className="text-gray-600 mb-8 text-xl">Inicia sesión para continuar</p>
        
        <div className="flex flex-col gap-5">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg text-xl"
          >
            <FaGoogle className="mr-4 text-3xl" /> Iniciar con Google
          </button>

          <button
            onClick={handleGithubSignIn}
            className="flex items-center justify-center w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg text-xl"
          >
            <FaGithub className="mr-4 text-3xl" /> Iniciar con GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

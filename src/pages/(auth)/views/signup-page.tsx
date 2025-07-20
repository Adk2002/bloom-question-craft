
import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { authService } from "../services/authService"

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signup(formData);
      alert('Signup successful!');
    } catch (error) {
      alert(error.message || 'Signup failed!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h- p-4 pb-24 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-5">
          {/* <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-[#5409DA] to-[#4E71FF] rounded-full"></div>
          </div> */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/80 text-sm sm:text-base">Sign up for a new account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-white font-medium text-sm">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#5409DA] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="signup-email" className="block text-white font-medium text-sm">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#5409DA] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="signup-password" className="block text-white font-medium text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="signup-password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#5409DA] focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#5409DA] to-[#4E71FF] text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Sign Up
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 border border-white/30">
              Continue with Google
            </button>
          </div>
          {/* Switch to Login */}
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">
              {"Already have an account? "}
              <button
                onClick={onSwitchToLogin}
                className="text-white font-semibold hover:underline transition-all duration-200"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

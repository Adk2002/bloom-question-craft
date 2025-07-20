// Now this file is to handle the login and signup pages

import { useState } from "react"
import LoginPage from "./views/login-page"
import SignupPage from "./views/signup-page"

export default function AuthPages() {
  const [currentPage, setCurrentPage] = useState<"login" | "signup">("login")

  const switchToSignup = () => setCurrentPage("signup")
  const switchToLogin = () => setCurrentPage("login")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8DD8FF] to-[#4E71FF] overflow-hidden">
      <div
        className={`flex w-[200vw] h-screen transition-transform duration-700 ease-in-out ${
          currentPage === "login" ? "translate-x-0" : "-translate-x-1/2"
        }`}
      >
        <div className="w-screen h-full">
          <LoginPage onSwitchToSignup={switchToSignup} />
        </div>
        <div className="w-screen h-full">
          <SignupPage onSwitchToLogin={switchToLogin} />
        </div>
      </div>
    </div>
  )
}

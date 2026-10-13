"use client";
import Sidebar from "@/component/Sidebar";
import ChatWidget from '@/component/ChatWidget';
import { IoIosNotifications } from "react-icons/io";
import { ReactNode, useState } from "react"
import { FaTimes } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const RootLayout = ({children}:{children: ReactNode}) => {
  const [activeNav, setactiveNav] = useState(false)
  const toggle = () =>{
    setactiveNav(!activeNav);
  }
  return (
    <main className="dasss">
        <Sidebar activeNav={activeNav} toggle={toggle} />
        <div className="dass-right">
          <div className="dash-nav">
            <UserButton />
            <div className="dash-nav-content">
              <button onClick={toggle} aria-label={activeNav ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={activeNav}>
                {activeNav === false ? (<FaBars />): (<FaTimes />)}      
              </button>
            </div>
          </div>
          {activeNav && <div className="dashboard-nav-overlay" onClick={toggle} aria-hidden="true" />}
          {children}
        </div>
        {/* Chat Widget positioned at bottom right */}
        <div className="chat-widget-container">
          <ChatWidget />
        </div>
    </main>
  )
}

export default RootLayout

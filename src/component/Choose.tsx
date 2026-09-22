"use client"
import { LuServer } from "react-icons/lu";
import { MdOutlineShield } from "react-icons/md";
import { LuBuilding } from "react-icons/lu";

import React from 'react'

const Choose = () => {
  return (
    <div className='choose'>
        <div className="choose-container">
            <div className="choose-top">
                <p className="eyebrow">BUILT AROUND YOU</p>
                <h1>Banking that feels refreshingly clear.</h1>
                <p>Simple everyday banking, intelligent tools, and security designed into every interaction.</p>
            </div>
            <div className="choose-wrapp">
                <div className="choose-content">
                    <span><MdOutlineShield className="choose_icon" /></span>
                    <h3>Security without compromise</h3>
                    <p>Thoughtful protection, secure access controls, and clear activity alerts work quietly in the background.</p>
                </div>
                <div className="choose-content">
                    <span><LuServer className="choose_icon" /></span>
                    <h3>Bank on your schedule</h3>
                    <p>Check balances, move money, and track your progress whenever it suits you.</p>
                </div>
                <div className="choose-content">
                    <span><LuBuilding className="choose_icon" /></span>
                    <h3>Guidance when it matters</h3>
                    <p>Get clear answers and practical support for the decisions that shape your financial future.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Choose

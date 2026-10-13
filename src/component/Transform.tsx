"use client"

import { LuPhone } from "react-icons/lu";
import { GoLock } from "react-icons/go";

import React from 'react'
import Link from "next/link";

const Transform = () => {
  return (
    <div className='transform'>
        <div className="transform-container">
            <div className="transform-left">
                <h1>
                    Banking that moves at your pace.
                </h1>
                <p>
                    Start with the everyday essentials and grow into the goals that matter most to you.
                </p>
                <div className="transform-btns">
                    <Link href={'/signup'}>
                        <button className="cursor-pointer">
                            Get started
                        </button>
                    </Link>
                    <Link href={'/signup'}>
                        <button className="cursor-pointer">
                            Explore services
                        </button>
                    </Link>
                </div>
            </div>
            <div className="transform-right">
                <h1>Here when you need us</h1>
                <div className="transform-right-support">
                    <span>
                        <LuPhone className="choose_icon" />
                    </span>
                    <div className="transform-right-text">
                        <h3>24/7 Support</h3>
                        <p>Support for every question</p>
                    </div>
                </div>
                <div className="transform-right-support">
                    <span>
                        <GoLock className="choose_icon" />
                    </span>
                    <div className="transform-right-text">
                        <h3>Secure Support</h3>
                        <p>Bank-grade encryption</p>
                    </div>
                </div>
                <Link href={'/signup'}>
                    <button className="cursor-pointer">
                        Contact VivaTrust
                    </button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default Transform

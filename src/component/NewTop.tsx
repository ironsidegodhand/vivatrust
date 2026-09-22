"use client"
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { useUser } from "@clerk/nextjs";

import UserBalanceCard from '@/component/Balance';
const NewTop = () => {
    const { user, isLoaded } = useUser();

        if (!isLoaded || !user) return null;
        const fullName = user?.fullName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  return (
        <div className="newboard">
        <div className="newboard-container">
            <div className="new-top">
                <span>
                    <span className="newLogo">VivaTrust Bank</span>
                    <h1>
                        Hello, {fullName}!
                    </h1>
                    <p>Welcome to VivaTrust Bank. Your financial overview is below.</p>
                </span>
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: {
                                width: '60px',
                                height: '60px'
                            }
                        }
                    }}
                />
            </div>
            <div className="new-card">
                <div className="float"></div>
                <UserBalanceCard />
            </div>
        </div>
    </div>
  )
}

export default NewTop

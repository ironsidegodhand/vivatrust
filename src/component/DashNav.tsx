"use client";

import React from "react";
import Link from "next/link";
import { FaBtc, FaChartLine } from "react-icons/fa6";
import { IoMdSwap } from "react-icons/io";
import { IoSendSharp } from "react-icons/io5";
import { MdAccountBalance, MdContactSupport } from "react-icons/md";

const DashNav = () => {
  return (
    <div className="dashnav">
      <Link href="/account">
        <div className="dashnav_con">
          <MdAccountBalance size={40} />
          <h3>Account</h3>
        </div>
      </Link>

      <Link href="/transactions">
        <div className="dashnav_con">
          <IoMdSwap size={40} />
          <h3>Transactions</h3>
        </div>
      </Link>

      <Link href="/transfer">
        <div className="dashnav_con">
          <IoSendSharp size={40} />
          <h3>Withdrawal</h3>
        </div>
      </Link>

      <Link href="/deposit">
        <div className="dashnav_con">
          <FaBtc size={40} />
          <h3>Bitcoin Deposit</h3>
        </div>
      </Link>

      <Link href="/analytics">
        <div className="dashnav_con">
          <FaChartLine size={40} />
          <h3>Analytics</h3>
        </div>
      </Link>

      <Link href="/support">
        <div className="dashnav_con">
          <MdContactSupport size={40} />
          <h3>Support</h3>
        </div>
      </Link>
    </div>
  );
};

export default DashNav;

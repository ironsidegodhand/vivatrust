// src/app/api/accounts/debit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Kyc from '@/models/kyc';
import History from '@/models/History';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { account, amount } = body;

    if (!account || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid account number and amount are required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Find the user by account number
    const user = await Kyc.findOne({ account });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Check current balance
    const currentBalance = parseFloat(user.balance) || 0;
    
    // Check if there's sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json(
        { 
          error: "Insufficient balance",
          currentBalance: currentBalance.toFixed(2)
        },
        { status: 400 }
      );
    }

    // Calculate new balance (deduct amount)
    const newBalance = currentBalance - amount;

    // Update the balance - same method as your credit API
    const updatedUser = await Kyc.findOneAndUpdate(
      { account },
      { balance: newBalance.toString() },
      { new: true, runValidators: true }
    );

    // Create transaction history record - same method as your credit API
    // Store negative amount for debit
    const historyRecord = new History({
      clerkId: user.clerkId,
      amount: (-amount).toString() // Negative amount to indicate debit
    });

    await historyRecord.save();

    return NextResponse.json({
      message: "Debit processed successfully",
      userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      newBalance: updatedUser.balance
    }, { status: 200 });

  } catch (error) {
    console.error('Debit error:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import History from '@/models/History';
import Kyc from '@/models/kyc';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Fetch all transactions with pagination
    const transactions = await History.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await History.countDocuments({});

    // gather clerkIds and lookup KYC data for names
    const clerkIds = [...new Set(transactions.map(tx => tx.clerkId))];
    const kycs = await Kyc.find({ clerkId: { $in: clerkIds } });
    const nameMap: Record<string, { firstName: string; lastName: string }> = {};
    kycs.forEach(k => {
      nameMap[k.clerkId] = { firstName: k.firstName, lastName: k.lastName };
    });

    return NextResponse.json({
      transactions: transactions.map(transaction => ({
        _id: transaction._id.toString(),
        clerkId: transaction.clerkId,
        firstName: nameMap[transaction.clerkId]?.firstName || '',
        lastName: nameMap[transaction.clerkId]?.lastName || '',
        amount: transaction.amount,
        createdAt: transaction.createdAt.toISOString(),
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasMore: skip + transactions.length < total
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Optional: Add endpoint to get a single transaction by ID
export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const transaction = await History.findById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // try to load user's name from KYC
    const kyc = await Kyc.findOne({ clerkId: transaction.clerkId });

    return NextResponse.json({
      transaction: {
        _id: transaction._id.toString(),
        clerkId: transaction.clerkId,
        firstName: kyc?.firstName || '',
        lastName: kyc?.lastName || '',
        amount: transaction.amount,
        createdAt: transaction.createdAt.toISOString(),
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectMongoDB from '@/lib/mongodb';
import Format from '@/models/Format';

const ADMIN_USER_IDS = new Set([
  'user_3Jdv3d9fKd7gUbp5tADLNGSDmq0',
  'user_3Jh2qAO7zznoASKIddNA2uD4ZCQ',
]);

// import { initializeUserFormats } from '@/lib/initFormats';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all formats without clerkId filter
    const formats = await Format.find({}).sort({ type: 1 });
    
    return NextResponse.json({ 
      success: true, 
      formats 
    });
  } catch (error) {
    console.error('Error fetching formats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch formats' },
      { status: 500 }
    );
  }
}

// POST - Update or create a format
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ADMIN_USER_IDS.has(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, title, description, type } = await request.json();

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let format;
    
    if (id) {
      // Billing formats are shared between the authorized administrators.
      format = await Format.findOneAndUpdate(
        { _id: id },
        { title, description, type },
        { new: true, runValidators: true }
      );

      if (!format) {
        return NextResponse.json(
          { error: 'Format not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new format
      format = await Format.create({
        clerkId: userId,
        title,
        description,
        type,
        form_id: `format_${Date.now()}`,
        approved: false
      });
    }

    return NextResponse.json({
      success: true,
      message: id ? 'Format updated successfully' : 'Format created successfully',
      format
    });
  } catch (error) {
    console.error('Error updating format:', error);
    return NextResponse.json(
      { error: 'Failed to update format' },
      { status: 500 }
    );
  }
}

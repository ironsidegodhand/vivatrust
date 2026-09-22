import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import connectMongoDB from '@/lib/mongodb';
import Container from '@/models/Container';

const fieldsAreValid = (data: Record<string, unknown>) =>
  typeof data.name === 'string' && typeof data.type === 'string' &&
  typeof data.capacity === 'string' && typeof data.image === 'string' &&
  typeof data.transitTime === 'string' && typeof data.includes === 'string' &&
  typeof data.price === 'number' && Number.isFinite(data.price) && data.price >= 0;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const data = await request.json();
    if (!fieldsAreValid(data)) return NextResponse.json({ error: 'Provide all service details and a valid price.' }, { status: 400 });

    await connectMongoDB();
    const { id } = await params;
    const container = await Container.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!container) return NextResponse.json({ error: 'Shipping service not found.' }, { status: 404 });
    return NextResponse.json({ container });
  } catch (error) {
    console.error('Could not update container:', error);
    return NextResponse.json({ error: 'Could not update shipping service.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectMongoDB();
    const { id } = await params;
    const container = await Container.findByIdAndDelete(id);
    if (!container) return NextResponse.json({ error: 'Shipping service not found.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Could not delete container:', error);
    return NextResponse.json({ error: 'Could not delete shipping service.' }, { status: 500 });
  }
}

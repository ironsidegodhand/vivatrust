import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import connectMongoDB from '@/lib/mongodb';
import Container from '@/models/Container';

const defaultContainers = [
  {
    name: '20ft Standard Container Shipping', price: 2710, type: '20ft Container',
    capacity: 'Up to 28 m³ · approx. 10 standard pallets', image: '/20ft-standard-container-Trident.jpg',
    transitTime: 'Estimated transit: 7–14 days', includes: 'Ocean freight, export documentation and shipment tracking',
  },
  {
    name: '40ft Standard Container Shipping', price: 4800, type: '40ft Container',
    capacity: 'Up to 58 m³ · approx. 20 standard pallets', image: '/pexels-photo-1117210.jpeg',
    transitTime: 'Estimated transit: 7–14 days', includes: 'Ocean freight, export documentation and shipment tracking',
  },
];

const fieldsAreValid = (data: Record<string, unknown>) =>
  typeof data.name === 'string' && typeof data.type === 'string' &&
  typeof data.capacity === 'string' && typeof data.image === 'string' &&
  typeof data.transitTime === 'string' && typeof data.includes === 'string' &&
  typeof data.price === 'number' && Number.isFinite(data.price) && data.price >= 0;

export async function GET() {
  try {
    await connectMongoDB();
    if (await Container.countDocuments() === 0) await Container.insertMany(defaultContainers);
    const containers = await Container.find({}).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ containers });
  } catch (error) {
    console.error('Could not fetch containers:', error);
    return NextResponse.json({ error: 'Could not fetch shipping services.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = await request.json();
    if (!fieldsAreValid(data)) return NextResponse.json({ error: 'Provide all service details and a valid price.' }, { status: 400 });

    await connectMongoDB();
    const container = await Container.create(data);
    return NextResponse.json({ container }, { status: 201 });
  } catch (error) {
    console.error('Could not create container:', error);
    return NextResponse.json({ error: 'Could not create shipping service.' }, { status: 500 });
  }
}

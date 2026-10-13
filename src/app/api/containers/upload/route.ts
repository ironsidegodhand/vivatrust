import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('image');
    if (!(file instanceof File) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5MB or smaller.' }, { status: 400 });

    const { uploadToCloudinary } = await import('@/lib/cloudinary');
    const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), 'containers', file.name);
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Could not upload container image:', error);
    return NextResponse.json({ error: 'Could not upload image. Check Cloudinary configuration.' }, { status: 500 });
  }
}

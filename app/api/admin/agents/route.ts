import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const agents = await User.find({ role: 'AGENT' }).select('name email');
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching agents' }, { status: 500 });
  }
}

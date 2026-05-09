import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { signupSchema, validateData } from '@/lib/validations';
import { sendEmailNotification } from '@/lib/actions/email.actions';
import { EMAIL_TEMPLATES } from '@/lib/constants/email-templates';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = validateData(signupSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    console.log('Connecting to DB for signup...');
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating user:', email);
    const user = await User.create({ name, email, password, role });
    console.log('User created successfully');

    // Notify Admin when a new agent is created (email + in-app notification)
    if (role === 'AGENT' || !role) {
      await sendEmailNotification('admin', 'New Agent Created', EMAIL_TEMPLATES.AGENT_CREATED, {
        agentName: name,
        agentEmail: email,
      });
    }

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user._id, name: user.name } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error during registration' },
      { status: 500 }
    );
  }
}

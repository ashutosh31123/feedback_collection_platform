import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, you'd fetch from database
    // For now, return empty array as forms are stored in localStorage
    return NextResponse.json({ forms: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate form data
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // In a real app, you'd save to database
    // For now, return success response
    const form = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      responses: []
    };

    return NextResponse.json({ form }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate response data
    if (!body.formId || !body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json(
        { error: 'Invalid response data' },
        { status: 400 }
      );
    }

    // In a real app, you'd save to database
    // For now, return success response
    const response = {
      id: Date.now().toString(),
      formId: body.formId,
      answers: body.answers,
      submittedAt: new Date().toISOString()
    };

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
} 
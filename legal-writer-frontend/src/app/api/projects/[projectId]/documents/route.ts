import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

// GET /api/projects/[projectId]/documents
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${params.projectId}/documents/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// POST /api/projects/[projectId]/documents
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND_URL}/api/projects/${params.projectId}/documents/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to create document');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

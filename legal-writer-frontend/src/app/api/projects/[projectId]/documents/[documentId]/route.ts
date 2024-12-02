import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

// GET /api/projects/[projectId]/documents/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/documents/${params.documentId}/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// PATCH /api/projects/[projectId]/documents/[documentId]
export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/documents/${params.documentId}/`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update document');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

// DELETE /api/projects/[projectId]/documents/[documentId]
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; documentId: string } }
) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/documents/${params.documentId}/`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

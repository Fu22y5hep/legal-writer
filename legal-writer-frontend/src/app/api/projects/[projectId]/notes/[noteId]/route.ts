import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/projects/[projectId]/notes/[noteId]
export async function GET(
  request: Request,
  { params }: { params: { projectId: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/notes/${params.noteId}/`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching note:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch note' }),
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/notes/[noteId]
export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/notes/${params.noteId}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating note:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update note' }),
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/notes/[noteId]
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; noteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/projects/${params.projectId}/notes/${params.noteId}/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete note' }),
      { status: 500 }
    );
  }
}

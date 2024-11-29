import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE /api/projects/[projectId]/notes/[noteId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; noteId: string } }
) {
  try {
    await pool.query(
      'DELETE FROM project_notes WHERE id = $1 AND project_id = $2',
      [params.noteId, params.projectId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

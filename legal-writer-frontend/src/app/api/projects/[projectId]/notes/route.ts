import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET /api/projects/[projectId]/notes
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const result = await pool.query(
      'SELECT * FROM project_notes WHERE project_id = $1 ORDER BY created_at DESC',
      [params.projectId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/notes
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { content } = await request.json();
    
    const result = await pool.query(
      'INSERT INTO project_notes (project_id, content) VALUES ($1, $2) RETURNING *',
      [params.projectId, content]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  const filteredProjects = projects.filter((project) => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-semibold text-gray-900">Projects</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all your legal document projects
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Create Project
              </Link>
            </div>
          </div>

          {/* Search input */}
          <div className="mt-8">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading ? (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            /* Projects grid */
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-4 text-xs text-gray-500">
                      Last modified: {new Date(project.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500">No projects found.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

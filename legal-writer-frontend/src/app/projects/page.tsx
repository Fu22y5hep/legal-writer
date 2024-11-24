'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    title: 'Contract Agreement',
    lastModified: '2024-01-15',
    status: 'In Progress',
  },
  {
    id: 2,
    title: 'Legal Brief',
    lastModified: '2024-01-14',
    status: 'Draft',
  },
  {
    id: 3,
    title: 'Terms of Service',
    lastModified: '2024-01-13',
    status: 'Completed',
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
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
              New Project
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="sm:w-64">
            <label htmlFor="search" className="sr-only">
              Search projects
            </label>
            <input
              type="search"
              name="search"
              id="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              id="status"
              name="status"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Project Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block group"
            >
              <div className="bg-white overflow-hidden shadow rounded-lg transform transition duration-200 hover:scale-105">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {project.title}
                  </h3>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Modified: {project.lastModified}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

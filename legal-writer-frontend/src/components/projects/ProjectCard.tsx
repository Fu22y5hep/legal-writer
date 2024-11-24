'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProjectCardProps {
  id: number;
  title: string;
  status: 'Draft' | 'In Progress' | 'Completed';
  lastModified: string;
  coverImage?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0].replace(/-/g, '/');
};

export default function ProjectCard({ id, title, status, lastModified, coverImage }: ProjectCardProps) {
  const statusColors = {
    Draft: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
  };

  return (
    <Link href={`/projects/${id}`} className="block group">
      <div className="relative h-[320px] bg-white rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-200 to-transparent" />
        
        {/* Cover image or placeholder */}
        <div className="relative h-3/4 bg-gradient-to-br from-blue-100 to-blue-50">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <h3 className="text-xl font-serif text-gray-700 text-center">
                {title}
              </h3>
            </div>
          )}
        </div>

        {/* Project details */}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(lastModified)}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Book page effect */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-200 to-transparent" />
      </div>
    </Link>
  );
}

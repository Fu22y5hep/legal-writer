import Link from 'next/link';
import ProjectCard from '@/components/projects/ProjectCard';

// Mock data for recent projects
const recentProjects = [
  {
    id: 1,
    title: 'Corporate Merger Agreement',
    status: 'In Progress' as const,
    lastModified: '2024-01-20',
  },
  {
    id: 2,
    title: 'Intellectual Property License',
    status: 'Draft' as const,
    lastModified: '2024-01-19',
  },
  {
    id: 3,
    title: 'Employment Contract Template',
    status: 'Completed' as const,
    lastModified: '2024-01-18',
  },
  {
    id: 4,
    title: 'Privacy Policy Update',
    status: 'Draft' as const,
    lastModified: '2024-01-17',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Legal Document Management</span>
              <span className="block text-blue-600">Powered by AI</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Create, manage, and collaborate on legal documents with the power of artificial intelligence.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/projects"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Recent Projects</h2>
          <Link
            href="/projects"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View all projects →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
            />
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">AI-Powered Writing</h3>
              <p className="mt-2 text-base text-gray-500">
                Get intelligent suggestions and automated formatting for your legal documents.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Organize and manage your legal documents in one secure location.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Collaboration Tools</h3>
              <p className="mt-2 text-base text-gray-500">
                Work together with your team in real-time with built-in collaboration features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Icons
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  PencilSquareIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Documents',
    href: '/documents',
    icon: DocumentTextIcon,
    description: 'Create and edit legal documents',
  },
  {
    name: 'AI Assistant',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    description: 'Get help with legal research and writing',
  },
  {
    name: 'Resources',
    href: '/resources',
    icon: FolderIcon,
    description: 'Manage your documents and files',
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: PencilSquareIcon,
    description: 'Create and manage notes',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/projects" className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-gray-900">Legal Writer</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 flex-shrink-0 h-6 w-6
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
                aria-hidden="true"
              />
              <div>
                <div className={isActive ? 'font-semibold' : ''}>{item.name}</div>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full rounded-md"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}

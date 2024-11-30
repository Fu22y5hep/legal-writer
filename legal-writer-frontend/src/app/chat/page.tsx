'use client';

import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Get help with legal research, writing, and document analysis
        </p>
      </div>
      
      <div className="h-[calc(100%-4rem)]">
        <ChatInterface />
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  DocumentTextIcon,
  DocumentIcon,
  DocumentCheckIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

export interface Template {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof templateIcons;
  content: string;
}

const templateIcons = {
  contract: DocumentCheckIcon,
  letter: DocumentTextIcon,
  brief: DocumentChartBarIcon,
  blank: DocumentIcon,
};

export const defaultTemplates: Template[] = [
  {
    id: 'blank',
    title: 'Blank Document',
    description: 'Start with a clean slate',
    icon: 'blank',
    content: '<h1>Untitled Document</h1><p></p>',
  },
  {
    id: 'contract',
    title: 'Contract Agreement',
    description: 'Standard contract template with common clauses',
    icon: 'contract',
    content: `
      <h1>Contract Agreement</h1>
      <p>This Agreement (the "Agreement") is made and entered into on [DATE] by and between:</p>
      <p><strong>Party A:</strong> [NAME/COMPANY], located at [ADDRESS] ("First Party")</p>
      <p><strong>Party B:</strong> [NAME/COMPANY], located at [ADDRESS] ("Second Party")</p>
      <h2>1. Purpose</h2>
      <p>[Describe the purpose of the agreement]</p>
      <h2>2. Term</h2>
      <p>This Agreement shall commence on [START DATE] and continue until [END DATE], unless terminated earlier pursuant to the terms herein.</p>
      <h2>3. Obligations</h2>
      <p>3.1 First Party agrees to:</p>
      <ul>
        <li>[Obligation 1]</li>
        <li>[Obligation 2]</li>
      </ul>
      <p>3.2 Second Party agrees to:</p>
      <ul>
        <li>[Obligation 1]</li>
        <li>[Obligation 2]</li>
      </ul>
    `,
  },
  {
    id: 'letter',
    title: 'Legal Letter',
    description: 'Professional legal correspondence template',
    icon: 'letter',
    content: `
      <div style="text-align: right;">[YOUR LAW FIRM]<br>[ADDRESS]<br>[CITY, STATE ZIP]<br>[PHONE]<br>[EMAIL]</div>
      <p>[DATE]</p>
      <p>[RECIPIENT NAME]<br>[RECIPIENT ADDRESS]<br>[CITY, STATE ZIP]</p>
      <p>Dear [RECIPIENT NAME],</p>
      <p>Re: [SUBJECT MATTER]</p>
      <p>[Body of the letter]</p>
      <p>Sincerely,</p>
      <p>[YOUR NAME]<br>[TITLE]</p>
    `,
  },
  {
    id: 'brief',
    title: 'Legal Brief',
    description: 'Standard legal brief format',
    icon: 'brief',
    content: `
      <h1 style="text-align: center;">IN THE [COURT NAME]</h1>
      <h2 style="text-align: center;">[JURISDICTION]</h2>
      <p style="text-align: center;">
        [PARTY NAME],<br>
        Plaintiff,<br>
        v.<br>
        [PARTY NAME],<br>
        Defendant.
      </p>
      <p style="text-align: right;">Case No. [NUMBER]</p>
      <h2>[DOCUMENT TITLE]</h2>
      <p>[INTRODUCTION]</p>
      <h3>STATEMENT OF FACTS</h3>
      <p>[Facts of the case]</p>
      <h3>ARGUMENT</h3>
      <p>[Legal arguments]</p>
      <h3>CONCLUSION</h3>
      <p>[Conclusion and prayer for relief]</p>
    `,
  },
];

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Choose a Template
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a template to start your document
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {defaultTemplates.map((template) => {
            const Icon = templateIcons[template.icon];
            return (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Icon className="h-6 w-6 text-gray-400 mt-1" />
                <div className="ml-4 text-left">
                  <h3 className="text-sm font-medium text-gray-900">
                    {template.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

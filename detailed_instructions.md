**Detailed Instructions for the Legal Writer Frontend**

### **Updated Next.js Route Structure**

Based on the navigation menu items (excluding the main route):

#### **Routes:**

- `/cases`
- `/cases/[id]`
- `/chats`
- `/chats/[id]`

#### **Page Implementations:**

---

#### **1. `/cases`**

**Core Purpose:** Display and manage the library of legal cases or projects.

**Key Components:**

- **CaseGrid:** Displays cases/projects in card format.
- **SearchBar:** Filter cases/projects by title or client name.
- **CreateCaseButton:** Opens a case/project creation modal.
- **CaseCard:** Individual case/project preview with key details.
- **FilterTags:** Filter cases/projects by status, category, or deadline.

**Layout Structure:**

- **Responsive Grid Layout:** Adjusts from 1 to 4 columns based on viewport size.
- **Sticky Search Bar:** Remains visible when scrolling.
- **Spacing:** Consistent margins and paddings using Tailwind CSS utility classes.

---

#### **2. `/cases/[id]`**

**Core Purpose:** View and edit individual cases or projects.

**Key Components:**

- **DocumentEditor:** Rich text editor for drafting legal documents.
- **MetadataPanel:** Title, description, client information, deadlines, and tags.
- **ShareButton:** Generate sharing links for collaboration.
- **CommentsSection:** Discussion thread for team communication.
- **VersionHistorySidebar:** Track document revisions.

**Layout Structure:**

- **Split View:**
  - **Main Area:** DocumentEditor.
  - **Side Panel:** MetadataPanel and VersionHistorySidebar.
- **Responsive Behavior:** Panels stack vertically on smaller screens.

---

#### **3. `/chats`**

**Core Purpose:** List and access AI-assisted chat conversations for legal research.

**Key Components:**

- **ChatList:** Displays recent conversations.
- **ChatPreview:** Snippets of recent messages.
- **StatusIndicator:** Shows active or archived states.
- **SearchConversations:** Filter chats by keywords or participants.

**Layout Structure:**

- **Two-Column Layout:**
  - **Left Column:** ChatList.
  - **Right Column:** Selected ChatPreview.
- **Responsive Behavior:** Columns stack on smaller screens.

---

#### **4. `/chats/[id]`**

**Core Purpose:** Real-time chat interface for legal research and AI assistance.

**Key Components:**

- **MessageThread:** Displays the conversation history.
- **MessageInput:** Rich text input with support for code snippets and attachments.
- **ParticipantsList:** Shows active users in the conversation.
- **LegalResearchPanel:** Provides quick access to legal resources and authorities.

**Layout Structure:**

- **Three-Panel Layout:**
  - **Left Panel:** ParticipantsList (collapsible).
  - **Center Panel:** MessageThread.
  - **Right Panel:** LegalResearchPanel (optional, can be toggled).
- **Responsive Behavior:** Panels collapse or become slide-out menus on mobile devices.

---

### **Layouts**

#### **1. DefaultLayout**

- **Applicable Routes:** All routes.
- **Core Components:**
  - **NavigationSidebar:** Includes links to `/cases`, `/chats`, `/authorities`, and user profile.
  - **TopHeader:** Displays logo, search bar, and user menu.
  - **Breadcrumbs:** Shows navigation hierarchy.
- **Responsive Behavior:**
  - **Collapsible Sidebar:** On mobile, the sidebar collapses into a hamburger menu.
  - **Sticky Header:** Remains at the top when scrolling.
  - **Adaptive Content Area:** Adjusts padding and margins based on screen size.

#### **2. CaseLayout**

- **Applicable Routes:** `/cases/[id]`.
- **Core Components:**
  - **EditorToolbar:** Tools for formatting and editing documents.
  - **VersionHistorySidebar:** Shows document revisions and allows reverting.
  - **StatusBar:** Displays save status, word count, and collaboration indicators.
- **Responsive Behavior:**
  - **Stacked Panels:** On mobile, sidebars collapse or move below the editor.
  - **Collapsible Sidebars:** Users can hide/show side panels.
  - **Floating Toolbars:** EditorToolbar adapts to screen size.

#### **3. ChatLayout**

- **Applicable Routes:** `/chats`, `/chats/[id]`.
- **Core Components:**
  - **ChatControls:** Options for starting new chats, filtering, and notifications.
  - **NotificationArea:** Displays alerts and system messages.
- **Responsive Behavior:**
  - **Slide-Out Panels:** ParticipantsList and LegalResearchPanel become slide-out panels on mobile.
  - **Bottom Sheet for Participants:** On small screens, active users list appears as a bottom sheet.
  - **Compact Message View:** MessageThread adjusts to fit smaller screens.

---

### **Implementation Details**

#### **1. Project Structure**

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── cases/
│   │   ├── page.tsx          // /cases
│   │   └── [id]/
│   │       └── page.tsx      // /cases/[id]
│   ├── chats/
│   │   ├── page.tsx          // /chats
│   │   └── [id]/
│   │       └── page.tsx      // /chats/[id]
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── NavigationSidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   ├── cases/
│   │   ├── CaseGrid.tsx
│   │   ├── CaseCard.tsx
│   │   ├── DocumentEditor.tsx
│   │   ├── MetadataPanel.tsx
│   ├── chats/
│   │   ├── ChatList.tsx
│   │   ├── MessageThread.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ParticipantsList.tsx
│   └── shared/
│       ├── SearchBar.tsx
│       ├── FilterTags.tsx
│       ├── Button.tsx
│       └── Icon.tsx
```

---

#### **2. 'use client' Directive**

Add `'use client'` at the top of all client-side components to enable client-side rendering in Next.js.

```tsx
'use client';

import React from 'react';
// Component code...
```

---

#### **3. Tailwind CSS Styling**

Utilize Tailwind CSS utility classes for styling and responsive design.

- **Responsive Classes:** Use `sm:`, `md:`, `lg:`, `xl:` prefixes for breakpoints.
- **Example:**

  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* CaseCards */}
  </div>
  ```

---

#### **4. Lucide React Icons**

Use icons from the `lucide-react` package.

- **Installation:**

  ```bash
  npm install lucide-react
  ```

- **Usage:**

  ```jsx
  import { Briefcase } from 'lucide-react';

  <Briefcase className="w-6 h-6 text-gray-600" />
  ```

---

#### **5. Stock Photos from picsum.photos**

Use valid URLs from `picsum.photos` for placeholder images.

- **Example:**

  ```jsx
  <img
    src="https://picsum.photos/seed/legal/300/200"
    alt="Case Placeholder"
    className="w-full h-auto"
  />
  ```

#### **Update next.config.js**

Configure `next.config.js` to allow images from `picsum.photos`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
```

---

#### **6. Avoid Duplicate Components**

Reuse components across different pages to maintain consistency and reduce redundancy.

- **Shared Components:** Place in `src/components/shared/`.
- **Examples:**

  - `Button.tsx`
  - `Input.tsx`
  - `Modal.tsx`

---

#### **7. Logos from CDN**

Automatically source and display logos from a CDN in design placeholders.

- **Example:**

  ```jsx
  <img
    src="https://cdn.example.com/logos/legal-writer-logo.png"
    alt="Legal Writer Logo"
    className="h-8 w-auto"
  />
  ```

---

#### **8. Proper Import Practices**

- **Use Path Aliases (`@/`)**

  ```javascript
  import Header from '@/components/layout/Header';
  ```

- **Organize Imports**

  - Group imports by category: external libraries, aliases, relative paths.

- **Update `src/app/page.tsx`**

  ```tsx
  'use client';

  import Header from '@/components/layout/Header';
  import CaseGrid from '@/components/cases/CaseGrid';
  import FilterBar from '@/components/shared/FilterBar';

  export default function HomePage() {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-screen-xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome back, [User Name]</h1>
          <FilterBar />
          <CaseGrid />
        </main>
      </div>
    );
  }
  ```

- **Root Route Handling**

  - Ensure that `page.tsx` in `src/app/` serves as the dashboard.

---

### **Detailed Page Implementations**

#### **/cases**

**Components:**

- **CaseGrid.tsx**

  ```tsx
  'use client';

  import React from 'react';
  import CaseCard from '@/components/cases/CaseCard';

  const CaseGrid = ({ cases }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem) => (
          <CaseCard key={caseItem.id} caseItem={caseItem} />
        ))}
      </div>
    );
  };

  export default CaseGrid;
  ```

- **CaseCard.tsx**

  ```tsx
  'use client';

  import React from 'react';
  import { Briefcase } from 'lucide-react';

  const CaseCard = ({ caseItem }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-2">
          <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold">{caseItem.title}</h2>
        </div>
        <p className="text-gray-600">{caseItem.clientName}</p>
        <p className="text-gray-500 text-sm">{caseItem.status}</p>
      </div>
    );
  };

  export default CaseCard;
  ```

---

#### **/cases/[id]**

**Components:**

- **DocumentEditor.tsx**

  ```tsx
  'use client';

  import React from 'react';
  import dynamic from 'next/dynamic';

  const RichTextEditor = dynamic(() => import('@/components/shared/RichTextEditor'), {
    ssr: false,
  });

  const DocumentEditor = ({ content, onChange }) => {
    return (
      <div className="w-full h-full">
        <RichTextEditor content={content} onChange={onChange} />
      </div>
    );
  };

  export default DocumentEditor;
  ```

- **MetadataPanel.tsx**

  ```tsx
  'use client';

  import React from 'react';

  const MetadataPanel = ({ metadata, onUpdate }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        {/* Metadata fields */}
      </div>
    );
  };

  export default MetadataPanel;
  ```

---

#### **/chats**

**Components:**

- **ChatList.tsx**

  ```tsx
  'use client';

  import React from 'react';
  import ChatPreview from '@/components/chats/ChatPreview';

  const ChatList = ({ chats }) => {
    return (
      <div className="divide-y divide-gray-200">
        {chats.map((chat) => (
          <ChatPreview key={chat.id} chat={chat} />
        ))}
      </div>
    );
  };

  export default ChatList;
  ```

- **ChatPreview.tsx**

  ```tsx
  'use client';

  import React from 'react';

  const ChatPreview = ({ chat }) => {
    return (
      <div className="p-4 hover:bg-gray-50">
        <h3 className="text-lg font-medium">{chat.title}</h3>
        <p className="text-gray-600">{chat.lastMessageSnippet}</p>
      </div>
    );
  };

  export default ChatPreview;
  ```

---

#### **/chats/[id]**

**Components:**

- **MessageThread.tsx**

  ```tsx
  'use client';

  import React, { useEffect, useRef } from 'react';

  const MessageThread = ({ messages }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <p className="text-sm text-gray-500">{message.sender}</p>
            <div className="bg-gray-100 p-2 rounded-lg">{message.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    );
  };

  export default MessageThread;
  ```

- **MessageInput.tsx**

  ```tsx
  'use client';

  import React, { useState } from 'react';

  const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
      if (message.trim()) {
        onSend(message);
        setMessage('');
      }
    };

    return (
      <div className="p-4 bg-white border-t">
        <input
          type="text"
          className="w-full border rounded-lg p-2"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
      </div>
    );
  };

  export default MessageInput;
  ```

---

### **Responsive Behavior**

- **Media Queries:** Utilize Tailwind CSS's responsive design utilities.
- **Example Classes:**

  - `hidden md:block`: Hide element on small screens, display on medium and up.
  - `flex-col md:flex-row`: Stack elements vertically on mobile, horizontally on desktop.

---

### **Conclusion**

By incorporating the specified routes and adapting the page implementations to fit the Legal Writer project, we've detailed a comprehensive frontend structure. This includes the necessary components, layouts, and responsive behaviors required to build a user-friendly and functional legal writing platform.

All components adhere to the initial requirements:

- Use of `'use client'` directive.
- Styling with Tailwind CSS.
- Icons from `lucide-react`.
- Valid stock photos from `picsum.photos`.
- Proper configuration of `next.config.js`.
- Avoidance of duplicate components.
- Sourcing logos from a CDN.
- Following proper import practices.

---

**Next Steps:**

- Begin implementing the components as per the detailed instructions.
- Ensure all routes are correctly configured in Next.js.
- Test responsive behaviors across different devices and screen sizes.
- Integrate with backend APIs for data fetching and state management.

**Note:** The detailed instructions are a starting point, and the final implementation may differ slightly based on the specific requirements of the Legal Writer project.
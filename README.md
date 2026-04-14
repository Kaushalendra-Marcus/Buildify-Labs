# AI Business Intelligence Workspace

A Next.js–based Generative AI Business Intelligence platform that transforms natural language prompts into live, interactive analytics components such as metrics, charts, comparisons, alerts, and insights.

This project demonstrates how conversational AI can dynamically generate frontend UI components for business analytics workflows.

## Live Demo
**[Try it here →](https://ai-business-intelligence-eight.vercel.app/)**

## 📺 Youtube Video
**[Try it here →](https://youtu.be/m9KzbpcNw5A?si=Fkdge5-ajeabYA8X)**

## Overview

The AI Business Intelligence Workspace allows users to interact with data using plain English. Instead of manually building dashboards, users simply ask questions like:

- Show revenue metrics for Nike
- Analyze growth for Apple  
- Compare Amazon vs Microsoft
- Generate business summary for Tesla
- Show alerts for Walmart
- Create dashboard for Campus X

The system responds by rendering structured UI components in real time.

This project uses Tambo AI to interpret tool-based responses and map them directly to React components.

## Screenshots
<img width="1919" height="531" alt="image" src="https://github.com/user-attachments/assets/b87cbc1f-e7c9-4760-9777-9f53c8e7572f" />
<img width="1896" height="967" alt="image" src="https://github.com/user-attachments/assets/80ae9e24-b574-485d-9b0f-2930f946710f" />
<img width="1918" height="975" alt="image" src="https://github.com/user-attachments/assets/6d071c9e-315b-483a-9d65-a6a9a2aa341c" />
<img width="1918" height="969" alt="image" src="https://github.com/user-attachments/assets/41b992bc-bb35-4565-a08e-0293a18c1353" />

*Sample analytics components generated from user queries*

## Key Features

- **Conversational analytics interface** - Natural language to UI components
- **Dynamic UI generation** - Real-time component rendering from AI responses
- **Comprehensive analytics** - Metric cards, graphs, comparison views, alerts, insights, and tables
- **Intelligent workspace** - Manage and organize generated components
- **Query context filtering** - Filter components by Amazon, Microsoft, or General contexts
- **Session management** - Multiple conversation sessions with isolated components
- **Fully responsive** - Works seamlessly on desktop and mobile
- **Modern design system** - Tailwind-based with glass-morphism effects
- **Modular architecture** - Easy to extend and customize
- **Mock AI backend** - Prototype-ready (easy to replace with real LLMs)
- **Analytics integration** - Vercel Analytics for usage tracking

## Architecture

### High-Level Flow
```
User Prompt
   ↓
Next.js API Route (/api/tambo/message)
   ↓
AI-style Tool JSON Response
   ↓
Tambo Provider
   ↓
Workspace Store (Zustand)
   ↓
React Components Rendered in UI
```

### Component Generation

The backend returns structured messages such as:

```json
{
  "type": "tool",
  "name": "show_component_MetricCard",
  "args": {
    "title": "Monthly Revenue",
    "value": "$245,000",
    "_queryContext": "amazon",
    "_sessionId": "session-123"
  }
}
```

These tool messages are intercepted by Tambo and automatically mapped to registered React components.

## Project Structure

```
public/
└───src
    ├───app
    │   └───api
    │       └───tambo
    │           └───message
    │               └───route.ts       # AI message endpoint
    ├───components
    │   ├───chat
    │   │   └───ChatInterface.tsx     # Main chat interface
    │   ├───providers
    │   │   └───TamboProviderWrapper.tsx
    │   ├───tambo
    │   │   ├───MetricCard.tsx
    │   │   ├───GraphCard.tsx
    │   │   ├───ComparisonCard.tsx
    │   │   ├───InsightCard.tsx
    │   │   ├───AlertList.tsx
    │   │   ├───BusinessSummaryTable.tsx
    │   │   └───StatusBadge.tsx
    │   └───workspace
    │       ├───QueryGroupCard.tsx
    │       └───ResizableComponentsPanel.tsx
    ├───lib
    │   ├───hooks
    │   │   └───useTamboWorkspaceIntegration.ts
    │   ├───store
    │   │   ├───workspace-store.ts
    │   │   └───query-groups-store.ts
    │   └───tambo
    │       └───schema.ts
    └───styles
        └───globals.css
```

### Core Components

#### **API Layer**
**`src/app/api/tambo/message/route.ts`**
Acts as a mock AI backend that:
- Processes user input
- Detects intent (revenue, comparison, alerts, etc.)
- Returns simulated AI responses
- Emits tool-based JSON for UI generation

*Note: Can be replaced with OpenAI, Claude, Gemini, or any custom LLM*

#### **Chat Interface**
**`src/components/chat/ChatInterface.tsx`**
Handles:
- Real-time message exchange
- File uploads and previews
- Component workspace management
- Quick prompts for common queries
- Query context filtering (Amazon/Microsoft/General)

#### **AI Components** (`src/components/tambo/`)
- `MetricCard` - Display key performance indicators
- `GraphCard` - Visualize trends with interactive charts
- `ComparisonCard` - Side-by-side comparisons
- `InsightCard` - AI-generated business insights
- `AlertList` - Notification and alert system
- `BusinessSummaryTable` - Tabular data presentation
- `StatusBadge` - System status indicators

#### **State Management**
**`src/lib/store/workspace-store.ts`**
- Manages workspace components
- Handles session isolation
- Component ordering and filtering
- File upload management

#### **Styling System**
**`src/app/globals.css`**
- Tailwind theme customization
- Glass-morphism effects
- Responsive grid layouts
- Smooth animations and transitions

#### **Analytics Integration**
**Vercel Analytics** - Tracks usage metrics, page views, and user interactions for performance monitoring.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React** | UI component library |
| **Tailwind CSS** | Utility-first styling |
| **Tambo AI** | AI component generation |
| **Zustand** | Lightweight state management |
| **Zod** | Runtime type validation |
| **TypeScript** | Type safety and developer experience |
| **Vercel Analytics** | Usage tracking and monitoring |

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Kaushalendra-Marcus/AI-Business-Intelligence.git
cd AI-Business-Intelligence
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env.local` file:

```env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Usage Examples

### Quick Prompts
The interface includes quick prompts for common queries:
- "Show revenue metrics" → Generates metric cards
- "Create sales trend" → Creates interactive graphs
- "Business alerts" → Shows alert notifications
- "Compare quarters" → Side-by-side comparisons

### Query Contexts
Components are automatically tagged with query contexts:
- **Amazon** - Orange badges and filtering
- **Microsoft** - Blue badges and filtering
- **General** - No specific company context

### Session Management
- Start new conversations in isolated sessions
- Clear components by session
- Maintain multiple analysis contexts simultaneously


## Deployment

The project is configured for easy deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy automatically

## Current Implementation

The AI responses are currently mocked in:
**`src/app/api/tambo/message/route.ts`**

This allows rapid prototyping without external LLM costs. You can replace this with:

- **OpenAI GPT-4/3.5**
- **Anthropic Claude**
- **Google Gemini**
- **Custom AI backend**
- **Azure OpenAI**

Simply modify the route to return Tambo-compatible tool JSON from your chosen AI service.

## Future Enhancements

- **Real LLM Integration** - Connect to OpenAI, Claude, or Gemini
- **Data Ingestion** - CSV/Excel file processing
- **Advanced Filtering** - Multi-dimensional filtering
- **Export Options** - PDF/PNG dashboard exports
- **Collaboration** - Multi-user workspace sharing
- **Database Backend** - Persistent component storage
- **Authentication** - User accounts and permissions
- **API Integration** - Connect to real business data sources
- **Custom Components** - Extendable component registry
- **Template Library** - Pre-built dashboard templates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

**Kaushalendra**  
[GitHub](https://github.com/Kaushalendra-Marcus)  
[Live Demo](https://ai-business-intelligence-eight.vercel.app/)

---

*Built with ❤️ using Next.js, React, and Tambo AI*

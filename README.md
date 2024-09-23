# Content Writer Assistant

## Overview

Content Writer Assistant is a an application built using LangGraph's new `SharedValue` managed state feature. This app demonstrates how developers can leverage `SharedValue` to persist state values in memory, enabling dynamic and personalized interactions.
The assistant learns from user feedback by generating specific rules, which are then stored and retrieved through a `SharedValue` state memory field. On retrieval, these rules are used to generate tailored writing content, making it an invaluable tool for content creators, marketers, and anyone involved in writing tasks.

## Development

This repository contains a fully built out frontend chatbot, built on top of the [Assistant UI package](https://www.assistant-ui.com/). The frontend is built on Next.js.
For the backend, the writing agent has been implemented in both [TypeScript](./js/src/agent/index.ts), and [Python](./py/tweet_composer/__init__.py).

Running the app powered by either backend is simple thanks to LangGraph Cloud. For production deployments, simply specify `(js|py)/langgraph.json` as the graph configuration file.
For local development you can select either directory when opening in LangGraph Studio.

## Setup

### Prerequisites

This app uses LangGraph Cloud/Studio for development and production deployments. To use either, you'll need a LangSmith account. You can [sign up for free here](https://smith.langsmith.com/).

Then, [install LangGraph Studio here](https://studio.langchain.com/) for local development.

For LLMs, you'll need an Anthropic API key (however, switching out the model provider is an easy, one line change thanks to LangChain!). You can sign up for an Anthropic account [here](https://console.anthropic.com).

### Environment Variables

To set the required environment variables, copy the `.env.example` file to `.env` and fill in the required values:

```bash
# LangSmith tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=

# LLM API key
ANTHROPIC_API_KEY=

# Vercel KV stores. Used for system prompt storage.
KV_REST_API_URL=
KV_REST_API_TOKEN=

# LangGraph Deployment
LANGGRAPH_API_URL=
NEXT_PUBLIC_LANGGRAPH_GRAPH_ID="agent"
```

### Running the App

To run the app, first open the project in LangGraph Studio. Then, copy the development API url in the bottom left corner of the screen and paste it into the `LANGGRAPH_API_URL` environment variable.
Next, run the following commands:

```bash
cd
```

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Features

- **Next.js Integration:** A robust Next.js frontend that provides a seamless user experience.
- **LangGraph's SharedValue:** Utilizes the `SharedValue` feature to persist user-specific data in memory, allowing the assistant to remember and adapt to individual user preferences.
- **Dynamic Rule Generation:** The assistant generates and updates style and content rules based on user interactions, ensuring the content aligns with the user's desired tone and objectives.
- **Real-time Streaming:** Implements real-time message streaming with support for different streaming types, enhancing interactivity and responsiveness.
- **User-Friendly Interface:** Equipped with intuitive UI components built with Tailwind CSS and React, including dialogs, dropdowns, and editable message threads.
- **Vercel KV Integration:** Uses Vercel KV for efficient key-value storage, ensuring quick data retrieval and storage operations.
- **Customized Markdown Rendering:** Advanced markdown rendering with syntax highlighting and support for LaTeX via KaTeX, enhancing the readability of content.

## Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **State Management:** LangGraph with SharedValue
- **AI & NLP:** LangChain, LangGraph SDK, ChatAnthropic
- **Storage:** Vercel KV
- **Utilities:** TypeScript, Zod for schema validation, UUID for unique identifiers

## Getting Started

### Prerequisites

- **Node.js:** Ensure you have Node.js installed (version 14 or higher recommended).
- **Yarn:** Package manager for installing dependencies.

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/content-writer-assistant.git
   cd content-writer-assistant
   ```

2. **Install Dependencies:**

   ```bash
   yarn install
   ```

3. **Setup Environment Variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```bash
   LANGGRAPH_API_URL=http://localhost:8123 # Or your production URL
   LANGCHAIN_API_KEY=YOUR_API_KEY
   NEXT_PUBLIC_LANGGRAPH_GRAPH_ID=YOUR_GRAPH_ID
   KV_REST_API_TOKEN=your_vercel_kv_token
   KV_REST_API_URL=your_vercel_kv_url
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

### Running the Application

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## How It Works

### SharedValue Feature

The `SharedValue` feature in LangGraph allows the application to persist and share specific values across different parts of the application seamlessly. In Content Writer Assistant, `SharedValue` is used to store user-defined rules that guide the content generation process.

- **User Rules Persistence:** When a user interacts with the assistant by providing feedback or editing generated content, these interactions update the shared rules stored using `SharedValue`. These rules are then used to tailor future content generation, ensuring consistency and alignment with user preferences.
- **State Management:** The application builds a state graph using LangGraph, where nodes represent different stages of the conversation and rule generation. `SharedValue` ensures that rules persist across these nodes, maintaining a coherent and personalized user experience.

### Dynamic Rule Generation

The assistant analyzes user interactions to generate and update a set of style and content rules:

1. **Content Generation:** Users request content generation, and the assistant produces writing based on initial rules.
2. **User Feedback:** Users can revise the generated content. These revisions are analyzed to understand changes in style, tone, or structure.
3. **Rule Updates:** Based on the revisions, the assistant updates the `SharedValue` with new or modified rules, refining the content generation process for future interactions.

## Application Structure

- **`src/agent/index.ts`:** Contains the state graph and rule generation logic.
- **`src/components/`:** Houses all React components, including dialogs, chat interfaces, and UI primitives.
- **`src/hooks/`:** Custom React hooks for managing state and interactions with LangGraph.
- **`src/stores/vercel.ts`:** Implements the VercelMemoryStore for interacting with Vercel KV.
- **`src/app/api/`:** API routes for handling backend logic and streaming responses.
- **`src/constants.ts`:** Defines application-wide constants, including default system rules and cookie keys.
- **`src/app/page.tsx`:** The main application page integrating all components and hooks.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

MIT License. See [LICENSE](LICENSE) for more information.
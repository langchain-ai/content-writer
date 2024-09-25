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
cd ./js

yarn dev
```

This will start the web-server on [`localhost:3000`](http://localhost:3000).

## Features

### Shared State

Shared state (or shared values) is a concept in LangGraph which allows developers to create fields in their graph state which persist between threads.

This is different from checkpointers for a few min reasons:

1. Shared state fields are scoped to single fields, not entire threads.
2. Each shared state field is tied to a specific key, so it can be accessed from multiple graphs which shared the same key.
3. Shared state fields are not returned in the response, and are only available inside of the graph nodes.

This app utilizes shared state to store generated rules on users writing style, business logic, and general context.

### Multiple Assistants

Content Writer Assistant supports multiple assistants, each leveraging LangGraph's `SharedValue` state for unique contexts.

- **Customization**: Create assistants with distinct names, descriptions, and system rules.
- **Isolated Contexts**: Each assistant maintains separate generated rules and context in `SharedValue` fields.
- **Easy Switching**: Toggle between assistants via the top-right dropdown menu.

This feature enables specialized assistants for different writing tasks or styles, improving versatility and organization. Each assistant's unique identifier keys its `SharedValue` field, ensuring efficient retrieval and updating of assistant-specific information.
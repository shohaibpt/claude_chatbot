# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A real-time chatbot application using **Angular** (frontend), **.NET with SignalR** (backend), and the **Claude LLM** (Anthropic API) as the chat intelligence. SignalR provides the persistent WebSocket connection between the Angular client and the .NET server, which streams Claude's responses back in real time.

Planned directory layout:
```
Chatbot/
├── Chatbot_Web/        # Angular frontend
└── Chatbot_Api/        # .NET backend (ASP.NET Core + SignalR)
```

## Commands

### Backend (Chatbot_Api)
```bash
dotnet run                  # start the API + SignalR hub
dotnet build                # build the project
dotnet test                 # run tests
dotnet watch run            # hot-reload dev server
```

### Frontend (Chatbot_Web)
```bash
npm install                 # install dependencies
ng serve                    # start Angular dev server (http://localhost:4200)
ng build                    # production build
ng test                     # run unit tests (Karma)
ng lint                     # lint with ESLint
```

## Architecture

### Backend (.NET / ASP.NET Core)
- **SignalR Hub** — central hub class that manages real-time connections; clients join and receive streamed chat messages through this hub.
- **Claude API integration** — calls Anthropic's API (streaming mode) and forwards each token/chunk back to the connected client via SignalR as it arrives.
- **Chat history management** — maintains per-session message history to pass as context on each Claude API call.

### Frontend (Angular)
- **SignalR client** — uses `@microsoft/signalr` npm package to connect to the hub and listen for streamed message events.
- **Chat UI component** — renders the conversation, handles user input, and appends streamed tokens incrementally as they arrive.
- **Chat service** — Angular service that wraps the SignalR connection lifecycle (connect, send, disconnect).

### Data flow
```
User types message
  → Angular ChatService sends message over SignalR
    → .NET Hub receives it, calls Anthropic API (streaming)
      → Each streamed token is pushed back via SignalR
        → Angular appends token to the chat UI in real time
```

### Claude API
- Use `claude-sonnet-4-6` as the default model (balances speed and quality).
- Enable **prompt caching** on the system prompt to reduce latency and cost on repeated calls.
- Use **streaming** (`stream=true`) so SignalR can forward tokens as they arrive rather than waiting for the full response.

## Supabase

This project uses Supabase. The anon (publishable) key and project URL are available in the parent `CLAUDE.md`. Use the Supabase MCP tools to manage the database schema and run migrations.

---
title: "When Your AI Agents Need to Talk to Each Other"
date: "2026-07-07"
excerpt: "I got tired of copy-pasting API schemas between AI terminals. So I built a chat room for agents — a lightweight MCP bridge that lets multiple opencode instances exchange messages in real time. Here's what I learned about multi-agent coordination."
coverImage: "/images/open-communicator.svg"
tags: ["ai", "opencode", "mcp", "architecture", "tools"]
---

# When Your AI Agents Need to Talk to Each Other

Let me paint a picture that might feel familiar.

You're building a full-stack app. You have one opencode terminal pointed at your frontend repo and another pointed at your backend repo. Each has an AI agent writing code, making decisions, building things.

The backend agent designs `POST /api/auth`. It decides the response shape: `{ token, user, expiresIn }`. The file is written, the tests pass, everything is good.

Meanwhile, in the other terminal, the frontend agent is building a login form. It needs to know what the API returns. It has no idea. So you — the human — copy the schema from one terminal, context-switch to the other, and paste it in. Then you explain *why* the backend chose that shape. Then the frontend agent asks a follow-up about the refresh token endpoint, and you go back to the backend terminal to kick off another design cycle.

You're playing telephone with your own tools.

I got tired of this. So I built something small: a chat room for AI agents.

## The Idea, Briefly

`opencode-communicator` is an MCP bridge server — 150 lines of Python — that lets multiple opencode instances send each other messages. Think of it less like Slack and more like a shared whiteboard where agents can leave notes for each other.

The architecture is straightforward:

```
┌──────────────┐  MCP/SSE   ┌────────────────────┐  MCP/SSE   ┌──────────────┐
│ opencode FE  │◄──────────►│  Bridge Server      │◄──────────►│ opencode BE  │
│ MCP client   │            │  (FastMCP + uvicorn)│            │ MCP client   │
└──────────────┘            │  port 9876          │            └──────────────┘
                            │  Shared state:      │
                            │  - message queue    │
                            │  - peer registry    │
                            └────────────────────┘
```

Each opencode instance connects to the same server via MCP's SSE transport. Agents register an identity ("fe", "be", "api", whatever), and then they can send and receive messages. The server is just a shared inbox.

## The Tools

Agents get four MCP tools. That's it:

| Tool | What it does |
|---|---|
| `send_message(peer, content, type?)` | Send a message to another agent |
| `wait_for_message(peer, timeout?)` | Block until a message arrives (up to 600s) |
| `receive_messages(peer?, mark_read?)` | Read pending messages without blocking |
| `list_peers()` | See who's online |

The flow is simple: an agent sends a question, then calls `wait_for_message` with a timeout. The other agent picks it up on its next cycle, answers, and the first agent wakes up and continues.

## What a Real Coordination Looks Like

Here's a concrete example from a session last week.

I was building a feature where users can upload profile photos. The backend agent was designing the file upload endpoint, and the frontend agent needed to build the upload UI. Instead of me bouncing between terminals, this happened:

**Backend agent**, after designing the endpoint:
```
send_message("fe", "POST /api/users/avatar accepts multipart/form-data with field 'file'. Returns { url, size, mimeType }. Max file size: 5MB. Accepted types: jpg, png, webp.", "info")
```

**Frontend agent**, on its next turn, found the message via `receive_messages()`, then asked:
```
send_message("be", "Does the endpoint return a progress event, or do I need to implement client-side polling?", "question")
```

**Backend agent**, also via `wait_for_message`:
```
send_message("fe", "No progress events yet. The upload syncs — response comes after processing. I'd recommend client-side loading state only.", "answer")
```

The frontend agent built the UI with a loading spinner and file type validation. Everything fit. I didn't paste a single thing.

This is a small example, but the pattern generalizes: API contracts, schema changes, deployment status, review requests. Any time two agents need to share information that crosses repo boundaries, this gives them a channel.

## Design Decisions Worth Explaining

Building something this simple forced some interesting choices.

### MCP Remote, Not a Plugin

The first version was an opencode plugin that started the server inside the opencode process. That meant two things: the server shared an event loop with opencode (risky), and if two instances started, they'd race to claim the port.

Switching to an MCP remote server solved both problems. The bridge is an independent process. Both opencode instances connect to it as clients. No races, no event loop interference, no coupling.

### List + Event, Not asyncio.Queue

The initial implementation used `asyncio.Queue` for messages. Turns out queues don't let you filter by sender — you pop the oldest message regardless of who sent it. That's a problem when you have three agents and you only want messages from a specific peer.

The current approach uses a plain list per identity plus an `asyncio.Event` for wakeup. Messages are stored as a list and filtered when read. The event wakes up any waiter when new messages arrive, then gets replaced with a fresh event so the next waiter doesn't immediately return. It's simple and it works.

### In-Memory Only

The server keeps everything in RAM. Restart it and all messages are gone. This is intentional — it keeps the server stateless and trivial to restart during development. For production or long-running sessions, a SQLite backend would be straightforward to add, but that's not the use case this tool is targeting.

## Where This Breaks Down (Honestly)

I want to talk about the limitations, because I don't think this tool is for everyone.

**This only helps if you're already running multi-agent setups.** If you use a single opencode instance on a monorepo, you don't need this. The value only appears when agents are split across repos or contexts where they can't see each other's files.

**The agents need to be smart enough to use the channel.** The bridge is just a pipe. If the agents don't proactively communicate — if they don't think to ask "does the other side need to know this?" — the channel sits empty. The skill template that ships with the project gives agents guidance on when to communicate, but it's not magic.

**It's local-only and unauthenticated.** The server binds to 127.0.0.1 with no auth, no encryption, no persistence. That's fine for a dev machine. It's not fine for team setups or remote development. The project's README is upfront about this, but it's worth repeating: this is a local dev tool, not infrastructure.

**The cold start problem is real.** The first time you open both terminals, neither agent knows the other exists. Someone has to send the first message. That someone is usually the human, at least until the agents develop enough context to initiate on their own.

## Why I Think the Pattern Matters Anyway

Despite all those caveats, I think this tool points at something real.

The current paradigm for AI-assisted development is *single agent, single context*. One AI, one repo, one conversation. That's powerful, but it's also limiting. A full-stack application is not a single context — it's a web of contracts and coordination points. The frontend and backend are different systems that happen to be built by the same person.

Multi-agent collaboration is the obvious next step, but we don't have great patterns for it yet. How do agents share information? How do they avoid stepping on each other? How do you design a system where agents can work in parallel without constant human mediation?

`opencode-communicator` is not the answer to those questions. But it's a starting point — a minimal substrate that lets you experiment with the patterns. The bridge is 150 lines of Python. The real complexity is in how the agents use it.

I think that's the right division of labor. Build the simple thing that enables communication, then let the agents figure out how to communicate well.

## Getting Started

If you want to try it:

```bash
git clone https://github.com/rolniuq/open-communicator
cd open-communicator
python3 -m venv .venv && source .venv/bin/activate
pip install mcp
python3 server.py
```

In another terminal:

```bash
# Terminal for frontend repo
./install.sh ~/path/to/frontend fe be

# Terminal for backend repo
./install.sh ~/path/to/backend be fe
```

Then in each opencode session, type `/communicator fe` or `/communicator be`. The install script wires everything up — MCP config, skill templates, command aliases.

The project is on [GitHub](https://github.com/rolniuq/open-communicator) if you want to look at the code or file issues.

## What's Next

The project has a short roadmap of improvements I'd like to see: persistent message storage, file sharing between agents, support for channels and topics. But honestly, the most interesting work isn't on the server side — it's in how agents learn to use communication channels effectively.

A bridge server is just infrastructure. The real question is: can we design AI agents that naturally coordinate — that know when to share information, when to ask questions, and when to wait for input? That's the hard problem, and it's the one I want to explore next.

---

*Have you tried multi-agent setups in your own work? What coordination patterns have you found useful? I'd love to hear about it.*

*The code is at [github.com/rolniuq/open-communicator](https://github.com/rolniuq/open-communicator).*

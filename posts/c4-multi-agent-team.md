---
title: "I Built a Self-Organizing AI Team. Here's What I Learned."
date: "2026-07-09"
excerpt: "A single AI agent can only hold so much context. So I built C4 — a multi-agent team with a Leader and three Developers that collaborate on code autonomously. The surprising thing wasn't how much more it could build — it was how much the team dynamics mattered."
coverImage: "/images/c4-multi-agent-team.svg"
tags: ["ai", "opencode", "multi-agent", "architecture", "personal"]
---

# I Built a Self-Organizing AI Team. Here's What I Learned.

Let me paint a picture that might feel familiar.

You're building a feature. It's not a trivial feature — it touches the backend API, the database schema, the frontend components, and the deployment config. You open one opencode session and start working through it, one piece at a time. The agent writes the database migration. You wait. It writes the API endpoint. You wait again. It starts on the frontend, but by then the context window is getting full. It's forgotten the exact shape of the API response it designed two hours ago. It makes a guess. The guess is wrong. You correct it. The cycle continues.

I've been there more times than I can count. A single AI agent, no matter how capable, has a fundamental limit: it can only hold one context at a time. It works *serially* — one file, one function, one decision at a time. And as the task grows, the context window becomes a bottleneck. The agent forgets. It hallucinates. It makes inconsistent choices because it doesn't have the full picture anymore.

The obvious answer is to use multiple agents. But that introduces a new problem: how do they coordinate? How do they avoid stepping on each other? How do you divide work between them without spending all your time playing project manager?

I started asking these questions a few months ago. I built an internal prototype, then a shell script, then an OpenCode plugin. What emerged is a project I'm calling **C4** — and it's the closest thing I've seen to a genuinely autonomous AI development team.

---

## The Moment I Realized Serial Is Not Enough

It started with a frustration.

I was building a feature that required changes across four layers: a new database table, a REST API endpoint, a React component, and a Docker Compose update for the new service. In a human team, I'd assign the API work to one person, the frontend to another, and the DevOps changes to a third. They'd work in parallel and coordinate through API contracts.

With a single AI agent, every step was sequential. The agent designed the database schema, then the API, then the frontend — each step waiting for the previous one to complete. If the frontend needed a change in the API, the agent had to backtrack, re-read the API file, update it, then return to the frontend. It was slow. It was wasteful. And it produced code that felt *linear* — each layer was designed in isolation, without the back-and-forth tension that makes a well-integrated system.

I started wondering: what if I could give an AI team the same structure I'd give a human team? A lead who owns the architecture and splits the work. Specialists who own different layers. A review process to catch mistakes. An event log so everyone knows what's happened.

That was the seed of C4.

---

## The First Attempt: Bash and File Watchers

The first version was pure bash. No dependencies. No frameworks. Just a shell script that watches directories for `.md` files.

The idea was simple: agents communicate through files. The Leader writes tasks into a dev's queue directory. The Dev picks up the file, implements the task, writes a `.done.md` file. The Leader sees the done file, reviews it, and either approves or requests a revision. All coordination happens through the filesystem.

Here's the flow:

```
You write a goal.md
        │
        ▼
    Leader inbox/
        │
        ▼
Leader splits goal into tasks
        │
    ┌───┼───┬──────────┐
    │   │   │          │
    ▼   ▼   ▼          ▼
dev-1  dev-2 dev-3   (queues)
queue  queue queue
    │   │   │
    ▼   ▼   ▼
 Dev agents implement
    │   │   │
    ▼   ▼   ▼
 task-XXX.done.md files
        │
        ▼
  Leader reviews
        │
    ┌───┴───┐
    │       │
 approve  needs_revision
    │       │
    ▼       └──→ back to dev queue
  done!
```

The first time I got this working, I watched three AI terminals coordinate on a task without any human intervention. The Leader wrote tasks, the Devs picked them up and implemented them, the Leader reviewed and approved. I didn't touch a thing. It felt like watching a small factory run itself.

But the shell version had a limitation: it required multiple terminals, each running `./c4.sh watch`, and each agent needed to be explicitly told what to do. It was powerful but manual. It worked for anyone with any AI tool (Claude Code, Copilot, Cursor — whatever), but it wasn't *smooth*.

That's when I decided to build it as an OpenCode plugin.

---

## How C4 Actually Works (The Plugin Version)

The plugin version is the one I use daily, so I'll focus on that. It's a completely different architecture from the shell version — event-driven instead of file-polling, in-memory instead of filesystem-based, and orchestrated through OpenCode's subagent system.

The architecture looks like this:

```
User: "/c4 implement a REST API with auth"
    │
    ▼
Main session AI becomes Orchestrator
    │
    ├── calls c4_init() plugin tool → creates Session
    │
    ├── spawns Leader subagent → returns Task Plan
    │   (Leader decides: 3 tasks, assigns to dev-1, dev-2)
    │
    ├── for each task:
    │   ├── spawns Dev subagent → implements → returns DoneReport
    │   └── spawns Leader again → reviews → approve or revise
    │
    └── reports summary to user
```

The key insight is that the **main session AI acts as the orchestrator**. It doesn't do the work itself — it reads the command prompt instructions, calls plugin tools to manage state, and spawns subagents to do the actual thinking and coding. The plugins are minimal: just four tools for session management, validation, and logging.

The Leader is the real star. It has full autonomy to decide:

- How many tasks to create
- What each task should do (with explicit acceptance criteria)
- Which developer to assign each task to
- Whether to approve or request revision

This autonomy was a deliberate choice. I didn't want a system where every decision was hardcoded. I wanted an AI that could *plan* like a tech lead, not just execute like a script.

---

## A Real Example: Adding Rate Limiting

Let me show you what this looks like in practice.

Last week I needed to add rate limiting to a FastAPI project. The feature touched three areas: a Redis-backed rate limiter middleware, configuration settings, and tests. I typed:

```
/c4 Add Redis-based rate limiting to the FastAPI app. 
    100 requests/minute per user. Use X-RateLimit-* headers.
```

The Leader analyzed the request and created three tasks:

- **Task 1 (dev-1):** Implement `RateLimiter` class with Redis backend, sliding window algorithm, and header injection
- **Task 2 (dev-2):** Add configuration — `RATE_LIMIT_ENABLED`, `RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW` env vars with sensible defaults
- **Task 3 (dev-1):** Write unit tests covering normal flow, exceeded limit, Redis connection error, and config disabled

What happened next was fascinating. Dev-1 started on the rate limiter class. Dev-2 started on the configuration. They worked in parallel. When dev-1 finished the middleware, the Leader reviewed and noticed it was missing the `Retry-After` header on 429 responses. It requested a revision. Dev-1 fixed it, and the second review passed.

Meanwhile, dev-2's configuration task was approved on the first pass. Dev-1's test task was started and completed.

Total time: about 4 minutes for what would have taken me 20+ minutes of serial back-and-forth with a single agent. The parallel work alone was a win, but the review step was the real value — the Leader caught an edge case that neither I nor the dev agent had thought about.

---

## Design Decisions Worth Explaining

Building this forced some interesting tradeoffs.

### Leader Autonomy vs. Predictability

The easiest route would have been to hardcode the task breakdown: "create three tasks, assign round-robin, always write tests." That would have been reliable and predictable. But it would also have been brittle — every project is different, and a hardcoded plan would miss the nuances.

Instead, I gave the Leader full autonomy to decide the task breakdown, assignment, and review criteria. This means the quality of the output depends on the quality of the Leader's judgment. Sometimes that means the Leader makes suboptimal decisions. But more often, it means the system adapts to the project's specific needs in ways I couldn't have anticipated.

### File-Based State (Shell) vs. In-Memory State (Plugin)

The shell version uses `.md` files with YAML frontmatter for all state. It's universal — works with any AI tool that can read and write files. But it's slow (2-second polling intervals) and race-prone (two agents writing the same file).

The plugin version uses in-memory sessions managed by the plugin. It's fast (event-driven, no polling), reliable (no race conditions), and integrated (works within a single opencode session). But it requires OpenCode and loses state on crash.

Both modes exist because they serve different use cases. The shell version is for anyone using any AI tool. The plugin version is for the smooth experience.

### The Max-3-Retries Rule

Every task gets a maximum of three revision attempts. After that, it's marked as failed and the system moves on. This prevents infinite loops — a real risk when an AI agent keeps making the same mistake and the reviewer keeps rejecting it.

Three was an arbitrary choice, but it's worked well so far. Most tasks pass on the first or second attempt. The ones that don't usually have a fundamental problem that needs human judgment anyway.

---

## Where This Breaks Down (Honestly)

I want to be straightforward about the limitations, because I've seen people imagine this solves everything. It doesn't.

**This adds overhead for small tasks.** If you need to fix a typo or add a simple field to a form, spawning a full Leader-Dev-review pipeline is overkill. The `/c4` command is for features that touch multiple layers. For simple changes, just use your AI directly.

**The Leader's judgment is the bottleneck.** If the Leader misinterprets the goal or creates poorly-scoped tasks, the whole pipeline suffers. Garbage in, garbage out — just with more steps. I've had sessions where the Leader created five overlapping tasks that should have been one, and sessions where it missed critical acceptance criteria.

**Parallelism has limits.** C4 can run dev agents in parallel, but they're still writing to the same codebase. If two agents try to modify the same file simultaneously, you get merge conflicts. The system doesn't handle this gracefully yet — it relies on the Leader assigning tasks that are naturally isolated, which isn't always possible.

**It requires OpenCode (plugin version) or multiple terminals (shell version).** The plugin version is the better experience, but it ties you to OpenCode. The shell version works with any AI tool, but managing multiple terminals is cumbersome.

**The cold start is real.** The first time you use C4 in a project, the agents don't know the codebase. The Leader doesn't know the architecture. The Devs don't know the conventions. It takes a few cycles before the system develops enough context to be effective. I usually run a few small planning tasks before tackling something complex.

---

## Why the Pattern Matters Anyway

Despite all those caveats, I think C4 points at something real.

The current paradigm for AI-assisted development is *single agent, single context*. One AI, one conversation, one file at a time. That's powerful — but it's also limiting in a way we're only starting to understand.

Real software development is not a linear process. It's parallel. It's collaborative. It involves multiple people with different specialties working on different parts of the same system, coordinating through shared understanding of the architecture. The reason human teams work well isn't that each person is individually smart — it's that they divide labor, review each other's work, and catch each other's blind spots.

C4 is an attempt to bring that same structure to AI development. Not a single agent doing everything, but a *team* of agents with roles, responsibilities, and a review process. The Leader isn't just a manager — it's a second pair of eyes. The Devs aren't just code generators — they're specialists who can focus on their layer without being distracted by the full stack.

I don't think this is the final answer. But I think it's a step in the right direction. The tools we build for AI collaboration today will shape how we think about AI development tomorrow.

And honestly? Watching three AI agents coordinate on a feature without my input still feels a little like magic.

---

## Getting Started

If you want to try C4, there are two ways:

**Shell version (works with any AI tool):**

```bash
curl -fsSL https://raw.githubusercontent.com/rolniuq/c4/main/c4.sh | sudo tee /usr/local/bin/c4 > /dev/null && sudo chmod +x /usr/local/bin/c4

cd ~/your-project
c4 install .
```

Then run `./c4.sh` in multiple terminals, register agents, and start sending goals.

**OpenCode plugin (smoother experience):**

```bash
# Same install
curl -fsSL https://raw.githubusercontent.com/rolniuq/c4/main/c4.sh | sudo tee /usr/local/bin/c4 > /dev/null && sudo chmod +x /usr/local/bin/c4

cd ~/your-project
c4 install .
opencode
```

Then in opencode:

```
/c4 implement a REST API with JWT authentication
```

The project is on [GitHub](https://github.com/rolniuq/c4) — MIT licensed, contributions welcome.

---

## What's Next

There's a lot I want to improve. The parallelism handling is the biggest pain point — I'd like to add smart file-locking so dev agents can safely work on the same file. The Leader's planning could be better with some project-specific knowledge injected into the process. And I'd love to add a web dashboard so you can watch the team work in real time.

But honestly, the most interesting work isn't technical. It's figuring out the *patterns* of multi-agent collaboration. What makes a good AI team? How many agents is too many? When should agents communicate directly vs. through a leader? These are questions that don't have good answers yet, and I think they're going to be some of the most important questions in AI-assisted development over the next few years.

C4 is my small contribution to figuring that out.

---

*Have you experimented with multi-agent setups? What patterns have you found useful? I'd love to hear about it — drop me a message or open an issue on the repo.*

*The code is at [github.com/rolniuq/c4](https://github.com/rolniuq/c4).*

---
title: "A Daypack for My Mac: Coding From Anywhere on a Phone"
date: "2026-08-05"
excerpt: "I wanted to fix bugs and ship features from Safari on my iPhone while the Mac sat at home. So I wrapped opencode in three launchd agents and a Tailscale mesh — no public ports, no sudo, no cloud relay of code."
coverImage: "/images/daypack.svg"
tags: ["opencode", "tailscale", "macos", "remote", "tools", "personal"]
---

# A Daypack for My Mac: Coding From Anywhere on a Phone

Let me set the scene.

It's a Sunday evening. I'm out — at a café, at a friend's place, on a train — and the MacBook Pro is at home on the desk, quietly humming. An idea hits me. Or worse: a bug. One of those fixes that takes forty seconds if I could just open the right file and type. Forty seconds is nothing when the machine is next to you. It's a whole evening of mental math when it isn't.

The machine isn't next to me. It's at home, running a real codebase I'd rather not try to replicate on a laptop in a café. So the question becomes: how do I reach it?

I could SSH in from my phone. I've done that. It's miserable — a terminal emulator on a 6-inch screen, editing with my thumbs, squinting at a text-based UI that wasn't made for touch. It works, but it feels like fighting my own tools.

What I actually wanted was the thing I already use every day at my desk: **opencode** — my AI coding agent — but on the phone, pointed at the same projects, with the same context. Open it in Safari, log in, and just *work*. Fix bugs, add features, deploy. All from a pocket.

That's how I got the itch to build `daypack` — a thin supervision layer that makes a Mac at home reachable from a phone anywhere.

## The Constraints That Shaped Everything

Before writing a line of it, I set the rules. Not because I'm disciplined — because I've seen what happens when you skip them.

1. **No public ports.** I was not about to port-forward 4096 on my home router and put an AI coding agent with filesystem access on the open internet. That's how you get pwned.
2. **No sudo.** This setup would live on a laptop that I want to keep boring and predictable. I didn't want to install kernel extensions or a TUN driver that needs root to keep running.
3. **No cloud relay of code.** There are products that tunnel your dev environment through their servers. Some are great. But the idea of my source code round-tripping through a third party's machines made me uncomfortable. The code should stay on the Mac. Always.
4. **It has to survive a reboot.** If it needs me to run five commands every time the Mac restarts, it'll die after the second week. It has to be a set-and-forget thing that starts with login.

With those four rules, the architecture basically chose itself.

## Why Not Build a UI? (The Kanna Temptation)

There's a well-known project in this space called **kanna** — a full application with its own web UI for Claude Code and Codex, complete with a client, a server, and a database. It's a legitimate approach. It's also hundreds of files of bespoke frontend and backend that you then have to maintain and keep compatible as the underlying tools evolve.

I seriously considered going that route. But then I looked at opencode and realized: **the web UI already exists.** opencode ships a `web` server out of the box — a password-gated HTTP server with a real interface. Everything kanna builds with hundreds of files, opencode does internally.

So daypack does the opposite of kanna: instead of rebuilding the wheel, it wraps it. The entire project is a few shell scripts and three launchd plist templates. The hard part was never the UI — it was keeping the thing alive, reachable, and secure. That's what I focused on.

## The Three Pillars of Daypack

Here's the mental model. Three launchd agents, each responsible for keeping one thing alive. If any of them crashes, launchd restarts it. That's the whole supervision story.

| Agent | Runs | Purpose |
|---|---|---|
| `com.daypack.opencode` | `opencode web --port 4096 --hostname 127.0.0.1` | The web UI + HTTP server, password-gated |
| `com.daypack.tailscale` | `tailscaled --tun=userspace-networking` | Private mesh network so the phone can reach the Mac anywhere |
| `com.daypack.keepawake` | `caffeinate -dimsu` | Prevents idle, disk, and App-Nap sleep while you're away |

Here's how they fit together:

```
┌──────────┐   Tailscale mesh (WireGuard)   ┌──────────────────────────────────┐
│  iPhone  │ ─────────────────────────────▶ │  MacBook                          │
│  (app)   │                                │                                   │
└──────────┘   https://…ts.net:443          │  tailscale serve (TLS terminator) │
                                            │      │  proxy                     │
                                            │      ▼                            │
                                            │  opencode web  127.0.0.1:4096     │
                                            │      (password-gated, loopback)   │
                                            │                                   │
                                            │  caffeinate -dimsu (keep awake)   │
                                            └──────────────────────────────────┘
```

The phone joins the Mac's **tailnet** — a private WireGuard mesh — via the Tailscale app. When it opens `https://<mac>.ts.net/`, that request travels over the mesh, gets TLS-terminated by `tailscale serve`, and is proxied to `127.0.0.1:4096` where opencode is listening. The browser sees a normal HTTPS site. The Mac's code never leaves the house.

## The Design Decisions Worth Explaining

This project is small, but it made me think hard about three things. I want to walk through them, because they're the reason daypack looks the way it does.

### 1. Userspace Tailscale: no sudo, but no mesh IP

Normal `tailscaled` needs root and a TUN interface. That breaks my "no sudo" rule. So daypack runs it in **userspace networking mode** — `tailscaled --tun=userspace-networking` — as a plain user agent.

The trade-off took me a while to internalize: **you cannot bind a server to the mesh IP** (e.g. `100.75.237.33`). There's no TUN interface to own it, so `opencode web --hostname 100.75.237.33` just fails to bind.

This sounds like a limitation, and it is — but it forces an architecture that's *safer anyway*. The server stays on loopback, invisible to LAN and internet alike. `tailscale serve` does all the exposure: it terminates TLS on the Tailscale address and proxies inward. Nothing is ever listening on a public or even LAN-facing interface.

I found this genuinely liberating. The safest setup isn't the one you have to remember to configure right — it's the one that's *impossible to misconfigure*.

### 2. The password gate: mesh ≠ privacy from your own tailnet

Here's a subtle thing people miss about Tailscale. The mesh keeps **strangers** out — eavesdroppers can't see your traffic. But it doesn't keep out **everyone**. Anyone else on your tailnet (family, colleagues, roommates) can reach every machine on it.

So a tailnet is a trust boundary, not a security boundary. Which meant I wanted a password in front of opencode too.

`opencode web` accepts `OPENCODE_SERVER_USERNAME` and `OPENCODE_SERVER_PASSWORD` environment variables. On first install, daypack generates a fresh random password with `openssl rand`, stores it in `~/.config/daypack/opencode.env` with restrictive permissions, and injects it into the plist. Credentials never live in the repo.

### 3. Environment via plist, not shell sourcing

This one bit me. launchd runs agents with a minimal PATH and **no interactive shell**. The obvious approach — a wrapper script that does `source ~/.config/daypack/opencode.env` — silently fails, because there's no shell to do the sourcing.

The fix is to inject every environment variable **declaratively** into the plist's `EnvironmentVariables` block. Including PATH — because the `opencode` binary I use is installed through nvm, and nvm shims don't exist in launchd's minimal PATH. The installer detects the real binary location (`readlink -f` on the shim, then walks up to the node bin dir) and bakes the right PATH into the plist.

This is the difference between a tool that works and one that works *in your terminal* but mysteriously fails at 3am on a reboot. launchd only trusts what's in the plist. Everything else is a trap.

## The Installer Made It Survive

The whole thing rests on two scripts:

```bash
./scripts/install.sh   # (re)generate creds, write plists, load all agents
./scripts/status.sh    # is everything up? print the phone URL
```

`install.sh` is the heart. It's idempotent — safe to run any number of times. It:

1. Generates (or reuses) a random password.
2. Detects the real `opencode` binary and derives a launchd-safe PATH.
3. Substitutes `{{PLACEHOLDER}}` values into plist templates in `launchd/`, writing them to `~/Library/LaunchAgents/`.
4. Unloads and reloads all three agents.

Because secrets and machine-specific paths stay out of git and get filled at install time, reinstalling is a one-liner — and it's how you change your password too. Edit the env file, re-run `install.sh`, done.

`status.sh` answers the question I'm always asking: *is it actually up?* It curls the local port, checks the tailnet status through the daypack socket, confirms `caffeinate` is running, and prints the exact URL to open on the phone.

## What It's Like to Use

Once it's installed, there's a nice moment where your Mac becomes a remote server you happen to also own.

The phone workflow is dead simple: open the Tailscale app (it must show **Connected**), then open `https://quynhs-macbook-pro.tail16fc03.ts.net/` in Safari, and log in with the daypack credentials. You get opencode's web UI, pointed at your machine, with your projects, your tools, your context.

One feature I love: **deep links.** If you append a base64url-encoded absolute path to the URL, opencode opens that project directly. I keep the encoded path for a few projects handy, so from the phone it's one tap — Safari opens straight into the exact repo I want, no navigation. A path like `/Users/raymond/Workspace/side/daypack` becomes `L1VzZXJzL3JheW1vbmQvV29ya3NwYWNlL3NpZGUvZGF5cGFjaw`, and the URL is `https://quynhs-macbook-pro.tail16fc03.ts.net/L1VzZXJzL3JheW1vbmQvV29ya3NwYWNlL3NpZGUvZGF5cGFjaw`.

Being honest: the phone is not my primary coding surface. But the number of times "let me just fix that one thing" went from *can't* to *done in forty seconds* has made the setup pay for itself many times over.

## Where It Breaks Down (Honestly)

Because I don't want to oversell this, here are the real limits.

**Lid-close sleep is unbeatable on Apple Silicon.** `caffeinate` prevents idle, disk, and App-Nap sleep. It cannot prevent the Mac from sleeping when you close the lid. I've hit this more than once: I'm away, I realize the Mac was left closed, and I'm stuck. The workaround is what everyone eventually lands on: connect power and an external display for true headless use. If your Mac sits closed on a desk, this matters more than any other consideration.

**There's a known route quirk in the opencode web server.** The `/api/project` path returns HTML while `/project` returns JSON — a version mismatch between the v2 SDK and the route. It only bites if you're scripting the API, but it's exactly the kind of thing that eats an hour when you find it.

**`caffeinate` is not server-grade uptime.** It guards against sleep triggers it can control. It can't guard against a full system restart, a kernel panic, or someone unplugging the Mac. This is a supervision layer, not infrastructure.

## The Philosophy: Borrow, Don't Build

If there's a lesson in this project, it's about resisting the urge to build.

The easy instinct, when you want a remote coding environment, is to build an app — a UI, a server, a database, a client. That's what kanna did, and it's a genuinely good product. But opencode had already solved 90% of the problem. My job was to notice that, and to spend my energy only on the 10% that was missing: keeping the process alive, making it reachable without opening the firewall, and gating it with credentials.

A few shell scripts and three plists did all of that. The whole repo — installer, status script, templates, docs — is smaller than the README of most projects I've shipped.

There's a version of this principle for your own work: before you build the thing from scratch, look hard at what's already sitting in the tools you use. The best engineering is sometimes just good packaging.

## Getting Started

The project is open source on [GitHub](https://github.com/rolniuq/daypack). The docs cover the architecture and operations in more detail.

If you want to try it on your own Mac, the flow is roughly:

1. Install [opencode](https://opencode.ai) and the Tailscale CLI.
2. Clone the repo and run `./scripts/install.sh`.
3. On your phone, install the Tailscale app and join the same tailnet.
4. Run `./scripts/status.sh` to get your phone URL, and apply the `tailscale serve` rule if it isn't already set.
5. Open the URL, log in, and you're in.

A few things to know: the `tailscale serve` mapping (`https://<mac>.ts.net/` → `http://127.0.0.1:4096`) needs to be applied once, and you'll want to read the operations runbook for the known gotchas — especially the lid-close sleep thing, which will bite you exactly when you least expect it.

## What's Next

The honest answer is that daypack is "done" in the sense that small tools are ever done — it does the one job, and I keep using it.

If I push it further, it'll be in the direction of hardening: more probing of the remote health from the phone side, maybe a small status endpoint so the phone can tell at a glance whether the Mac is awake and reachable. And I'm curious whether the same pattern — launchd supervision + Tailscale serve + an existing local tool — generalizes to other services I want from my phone. Postgres for a quick data check. The home server's web UI. Anything that's local but deserves to be portable.

The pattern turned out to be simple and repeatable. A supervised process, a private tunnel, a password. That's the whole daypack. And it's made my Mac feel less like a desk-bound machine and more like a pocket one.

---

*Do you reach your home machine from your phone? I'd love to hear what setup works for you — SSH, a tool like kanna, or something in between. The project is at [github.com/rolniuq/daypack](https://github.com/rolniuq/daypack).*

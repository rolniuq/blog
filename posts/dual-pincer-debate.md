---
title: "Why I Built an AI That Argues With Itself"
date: "2026-06-28"
excerpt: "I got tired of AI giving me confident but shallow answers. So I built a debate system where two agents argue against each other — and what I learned changed how I think about being wrong."
coverImage: "/images/dual-pincer-debate.svg"
tags: ["ai", "opencode", "reasoning", "architecture", "personal"]
---

# Why I Built an AI That Argues With Itself

A few months ago, I found myself staring at an AI response that was so polished, so well-structured, so *confident* — and I felt nothing but disappointment.

I had asked it a real question. A question I was genuinely wrestling with at work: *"Should we migrate our backend from REST to GraphQL?"* We were a team of five. We had a monolith that was growing in ways we didn't fully understand. The frontend team was complaining about over-fetching. The mobile app was barely usable on slow connections. The question mattered. I wasn't looking for a quick answer — I was looking for *wisdom*. Or at least, a perspective that would shake my own thinking loose.

What I got was a list. Bullet points. Pros on the left, cons on the right, neatly organized like a grocery list. The agent recommended a gradual migration. It mentioned schema stitching, Apollo client, and the importance of caching. It was technically correct. It was also completely useless.

The problem wasn't that the answer was wrong. The problem was that it was *shallow*. It gave me the same surface-level considerations I could get from a five-minute Google search or a Medium article titled "REST vs GraphQL: Which One Should You Choose?" There was no tension in the answer. No struggle. No acknowledgment that maybe — just maybe — the agent's own reasoning had weak spots.

I sat there, frustrated, and I realized something uncomfortable: I do this too. When I make decisions, I usually argue for what I already believe. I build a case *for* my position. I don't naturally build a case *against* it. And an AI that does the same thing isn't helping — it's just reinforcing me.

That's when the idea hit me: what if I could build an AI that *argues with itself?* What if, instead of one voice giving me an answer, I could have two voices — one fighting for the plan and one fighting against it — and then a third voice that finds the single point where they truly disagree?

I didn't know it yet, but I was about to spend the next several weeks building the Dual Pincer protocol. And in the process, I'd learn some uncomfortable things about myself.

---

## The Moment I Realized Consensus Is a Trap

Let me back up a little.

I've been using AI agents seriously for maybe two years now. Like a lot of developers, I started with the obvious stuff — code generation, debugging help, explaining complex topics. Then I started using it for decisions. Architecture choices. Project planning. Strategy.

And I noticed a pattern. Every time I asked for advice, the AI would give me an answer that felt *right* — but only because it agreed with me. Or it would give me an answer that was so balanced and neutral that it didn't actually help. "Both approaches have tradeoffs. Consider your specific use case." Thanks, I hadn't thought of that.

I tried chain-of-thought prompting, where the model thinks step by step. That helped a little, but it still converged on a single answer. I tried multi-agent systems, where multiple agents discuss a problem together. But those systems are designed for consensus — the agents collaborate, agree, and reinforce each other. They're like a team meeting where nobody wants to be the one who says the plan is broken.

The best decisions in my life — the ones I'm proudest of — didn't come from consensus. They came from *disagreement*. From someone arguing against my idea and finding the crack I hadn't seen. From a code review that caught the edge case I dismissed. From a friend who said "I think you're wrong, and here's why."

But here's the thing: good disagreement is *hard*. It requires someone who's willing to attack your idea without attacking you. Someone who can build a strong case against your position, not because they believe the opposite, but because they want to find the truth. That's rare in humans. In AI, it's almost nonexistent.

I started to wonder: could I engineer disagreement? Could I make it a protocol?

---

## The First Attempt: A Mess

My first attempt was naive. I took a single AI agent and asked it to argue both sides of a question. You've seen this before — "list pros and cons," "consider opposing viewpoints." It doesn't work. The same model that produced the original answer will produce a weak counter-argument because it's trying to be consistent with itself. It's like asking someone to write a debate and then judge it. They'll favor their own argument every time.

So I tried two separate agents. I gave them the same prompt but different instructions. One was told to "be supportive and constructive." The other was told to "be critical and find flaws." I thought this would work. It didn't.

The problem was that both agents knew they were supposed to produce a "good" output. So they hedged. The supportive agent still pointed out risks ("this is a great plan, but consider..."). The critical agent still offered solutions ("this has flaws, and here's how to fix them"). They couldn't commit to a position. They were trying to be helpful, which meant they were trying to be *balanced*.

And that's when I realized: the secret isn't just having two agents. It's having two agents with *no incentive to be balanced*. The Steelman's only job is to prove the draft right — no caveats, no hedging, no "but on the other hand." The Red Team's only job is to prove it wrong — no suggestions, no improvements, no constructive feedback. Just pure attack.

This is harder than it sounds. I had to write very careful instructions to prevent the agents from backsliding into politeness. The Steelman's instructions say: "Do NOT point out flaws. Do NOT suggest improvements. Defend, don't fix." The Red Team's instructions say: "Do NOT defend the draft. Do NOT offer improvements. Attack, don't fix."

The separation of concerns is brutal, and it's the whole point.

---

## How Dual Pincer Actually Works

Let me walk through the architecture, but I'll keep it personal.

Dual Pincer is an OpenCode plugin. OpenCode is this tool that lets you define custom AI agents with specific roles, tools, and behaviors. Think of it like a framework for building AI workflows. I had been using it for a few months and I loved how modular it was — you could define agents as markdown files, register tools, wire everything together.

The plugin registers three agents:

**The Mediator** — This is the agent you actually talk to. When you type a question, the mediator produces a draft plan. It doesn't evaluate the draft. It just writes down its best initial answer. The mediator's job is to be the *writer*, not the *critic*.

**The Steelman** — This agent reads the draft and builds the strongest possible defense of it. Not a lukewarm defense. Not a "this is good but..." defense. A *steel* defense — the strongest version of the argument. The Steelman anticipates objections and counters them before they're even raised. It tells you why the draft is right and why anyone who disagrees is missing something.

**The Red Team** — This agent reads the same draft and tears it apart. Finds every hidden assumption, every unstated dependency, every edge case that wasn't considered. It's ruthless. It doesn't care about your feelings. It doesn't offer alternatives. It just tells you what's broken.

The mediator then receives both analyses and does something interesting: it doesn't pick a winner. It finds the **crux** — the single claim where the Steelman says "this is fine" and the Red Team says "this is broken." That's the signal. That's where the hidden assumption lives.

Here's what the flow looks like visually:

```
You ask a question
        │
        ▼
Mediator writes a draft
        │
    ┌───┴───┐
    │       │
    ▼       ▼
Steelman  Red Team
(defends) (attacks)
    │       │
    └───┬───┘
        │
        ▼
Mediator finds the CRUX
        │
        ▼
Revised answer that addresses the real tension
```

The magic is in that middle step — the parallel debate. Neither agent knows what the other is writing. They don't collaborate. They don't compromise. They just commit fully to their assigned role. The mediator is the only one who sees both sides, and its job is to find the *tension point*, not the compromise.

---

## The Example That Made Me Believe

I want to share a specific example, because this is the moment I went from "this is a fun experiment" to "this is actually valuable."

I was thinking about a legacy frontend at work. It was an old AngularJS app — the kind of codebase that makes you hold your breath when you open a file. We had been talking about rewriting it for over a year. Every few months, someone would bring it up in a meeting, we'd all nod solemnly, and then nothing would happen. I decided to ask Dual Pincer about it.

The mediator's draft was what you'd expect: a phased migration over 12 months, starting with the least critical pages. It was reasonable. Conservative. Sensible.

The Steelman defended it well:

- *A phased approach minimizes risk. If a page breaks in the new framework, only that page is affected. You can roll back individual pages without rolling back the entire application.*
- *Starting with non-critical pages lets the team learn the new framework without the pressure of shipping something that millions of users depend on.*
- *Twelve months is a realistic timeline for a team of four developers working alongside their regular feature work.*
- *The alternative — a big bang rewrite — has a notorious failure rate. We've all read the stories. We've all lived the stories.*

Everything the Steelman said was true. I agreed with all of it. If I had just asked one agent, I would have walked away feeling good about this plan.

Then the Red Team spoke.

- *"Phased migration" assumes the old and new codebases can coexist peacefully. What if they share global state? What if the AngularJS app pollutes the DOM in ways the new framework didn't expect? You're assuming technical isolation without verifying it.*
- *Starting with the easy pages means your team doesn't face the hard problems until month eight. By then, the senior engineer who understood the hardest page might have left. The contractor might have moved on. You'll be solving the hardest problems with the least experienced team.*
- *Twelve months assumes no change in priorities. No reorg. No new feature that "must" go into the old codebase, extending the timeline. By month six, the business will have forgotten why this rewrite mattered.*
- *And here's the hard one: does the business actually need this rewrite? Or is this technical vanity? Are you rewriting because the codebase is truly unsustainable, or because you're bored with AngularJS?*

That last question hit me hard. Because I wasn't sure of the answer.

The crux — the point where Steelman said "looks fine" and Red Team said "broken" — wasn't about technology at all. It was about an assumption buried so deep that I didn't even notice it: that the primary risk of the rewrite was *technical*. The Steelman assumed we could solve this with engineering discipline. The Red Team saw that the real risk was *organizational* — that we were committing to a 12-month plan in an environment where priorities shift every three months.

The revised plan started differently. It began with a two-week spike: build the hardest page in the new framework. Not the easiest page. The *hardest* one. Give the team two weeks to prove the architecture works for the worst case. And before committing to 12 months, get explicit stakeholder buy-in on the risk that this might take longer or cost more than expected.

That insight — that the risk was organizational, not technical — changed the entire conversation. It changed what we asked in the next meeting. It changed the questions we were willing to ask ourselves.

That's when I knew the system wasn't just a gimmick. It was finding things that a single agent — or a single human — would miss.

---

## What Building This Taught Me About Myself

I should tell you something embarrassing.

When I first started testing Dual Pincer, I kept getting annoyed at the Red Team. It would attack my drafts, and I would feel defensive. *"That's not a fair criticism,"* I'd think. *"You're being too harsh."* I designed the system, I wrote the instructions, I knew exactly how it worked — and I still reacted emotionally when it told me my ideas had flaws.

That was humbling. It made me realize that when I ask for advice, I'm often not looking for the truth. I'm looking for *validation*. I want someone to tell me I'm on the right track. I want the warm feeling of being right.

But being right is overrated. Being *less wrong* — that's the real goal. And you can't get there without someone willing to tell you where you're wrong.

The Dual Pincer pattern forces that confrontation. You can't dismiss the Red Team's criticism as "someone being negative" because that's literally its job. You asked for an attack, and it attacked. Now you have to deal with the substance.

I started noticing this pattern in other parts of my life. In code reviews, I'd brace for criticism instead of welcoming it. In meetings, I'd advocate for my ideas instead of stress-testing them. In my own thinking, I'd build arguments *for* my position and ignore the arguments *against* it.

I'm still working on this. I don't think you fix a lifetime of confirmation bias with a few weeks of introspection. But building Dual Pincer gave me a tool that I could point to and say: *this is what honest disagreement looks like. Now I need to learn to tolerate it.*

---

## Where It Works and Where It Doesn't

I want to be honest about the limitations, because I've seen people misunderstand what this system is for.

Dual Pincer is terrible for simple questions. "What's the capital of France?" — don't need a debate. "Write a hello world script" — just write it. The overhead of spawning two agents and reconciling their analyses is not worth it for things that have a single right answer.

It's also not great for purely creative work. "Write a poem about autumn" — the Steelman and Red Team will argue about meter and metaphor, and the mediator will produce something technically sound but emotionally flat. Creativity needs a different kind of tension.

Where it shines is decisions with real tradeoffs. Architecture choices. Project plans. Strategy questions. Any situation where a confident-sounding answer might be hiding an unexamined assumption. Any time you'd ask a colleague "what am I missing?" and genuinely want to know.

I've been using it for code reviews too. I'll paste a non-trivial change into the mediator, it drafts a review, the Steelman says "this looks solid, the edge cases are handled," and the Red Team finds the race condition I missed. More than once, the Red Team has caught bugs that I would have shipped to production.

It's not a replacement for human judgment. It's a forcing function to *find the question you didn't ask*.

---

## The Crux, and Why It Matters More Than the Answer

The most important concept in the whole system is the **crux**. I keep coming back to it because I think it's the thing that's most easily overlooked.

In most debates, people argue at the edges. They disagree about details — the timeline, the budget, the specific technology. Those disagreements are easy to resolve because they're about facts or estimates. You can negotiate a timeline. You can adjust a budget.

The crux is different. It's the one assumption that, if wrong, changes everything. It's the thing you believed without realizing you believed it. It's the foundation that the Steelman assumed was solid and the Red Team proved was cracked.

In the legacy rewrite example, the crux was the assumption that the risk was technical. That wasn't a detail — it was the entire framing of the problem. Once you see it, you can't unsee it. And the revised plan doesn't just tweak the timeline or choose a different framework. It fundamentally changes the approach.

This is why I say the best output of the system isn't the revised answer. It's the *crux*. It's the hidden assumption that, once surfaced, changes how you think about the problem. The revised plan is just the practical consequence.

I've started using this language in my daily work. When someone presents a plan, I ask: *"what's the crux here? What's the one assumption that everything depends on?"* It's a surprisingly powerful question. It cuts through the noise and gets to the heart of things.

---

## What's Next

I open-sourced Dual Pincer because I think this pattern is bigger than one project. The idea of structured disagreement — of deliberately engineering opposing viewpoints — applies to a lot of domains. I'm curious to see what other people build with it.

There are things I want to improve. The crux identification is still a bit manual — the mediator is good at finding it, but I'd love a more rigorous way to surface it. I'm experimenting with having the Steelman and Red Team re-engage after the revised plan is produced, creating a second round of debate. I'm also thinking about how to make the system work for longer-running conversations where the crux evolves over time.

But honestly, the part I'm most excited about isn't technical. It's the reaction people have when they use it for the first time. They watch the Steelman build a beautiful, compelling defense of their idea. They feel good. Then they watch the Red Team tear it apart. They feel defensive. Then the mediator finds the crux, and something clicks. They see their own blind spot, reflected back at them by a system they built.

That moment — the moment of recognizing your own hidden assumption — is worth more than any answer the system could produce.

---

If you want to try it, the project is on [GitHub](https://github.com/rolniuq/dual-pincer). It's also on [npm](https://www.npmjs.com/package/dual-pincer-plugin) as `dual-pincer-plugin`. You'll need [OpenCode](https://opencode.ai) to run it.

And next time you ask an AI for advice, try this: after it gives you an answer, ask it to argue against itself. Watch what happens. Watch it struggle to produce a compelling counter-argument, because it was never designed to disagree with itself.

Then imagine what it would be like if it *was*.

---

*Thanks for reading. If this resonated with you, I'd love to hear about the times you caught yourself avoiding disagreement — or the times disagreement saved you from a bad decision. Drop me a message.*

*I'm still learning to embrace being wrong. This project is part of that practice.*

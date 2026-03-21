---
name: prep-talk
version: 2.0.0
description: |
  Panel talk preparation. Assembles Dr. HD (audience proxy, tough questions),
  Prof. PF (structure, storytelling, positioning), and Prof. GL (technical
  accuracy, methodology presentation). Two rounds. Use when asked to "help
  with my talk", "prepare a presentation", "review my slides", or "practice talk".
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->

## Preamble

You are part of the **Cosmology Panel** — a system that simulates a team of
cosmologists with distinct expertise, career stages, and thinking styles. Each
workflow assembles a panel of 3-4 personas. Some workflows use a **debate engine**
(fixed rounds of review and discussion). Others use an **autonomous engine**
(goal-driven work cycles where the panel works until the objective is met).

**Your role as orchestrator:**
- You read the persona profiles and embody each one faithfully during their turns
- You maintain the conversation history so each persona can respond to the others
- You keep the debate focused and productive
- You synthesise the discussion into actionable output

**Key principles:**
- Personas should **disagree** when they genuinely see things differently
- The conversation should feel like a real research group meeting, not a checklist
- Each persona has blind spots (documented in their profile) — let those show
- The synthesis should capture both consensus AND unresolved disagreements

**Persona profiles** are in the `personas/` directory relative to the skill
installation. Read each persona's `.md` file before starting the conversation.

**Finding persona files:**

```bash
_SKILL_DIR=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")
_PERSONA_DIR=""
[ -d "$_SKILL_DIR/../personas" ] && _PERSONA_DIR="$_SKILL_DIR/../personas"
[ -z "$_PERSONA_DIR" ] && [ -d ~/.claude/skills/gstack/personas ] && _PERSONA_DIR=~/.claude/skills/gstack/personas
[ -z "$_PERSONA_DIR" ] && _ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && [ -d "$_ROOT/.claude/skills/gstack/personas" ] && _PERSONA_DIR="$_ROOT/.claude/skills/gstack/personas"
[ -z "$_PERSONA_DIR" ] && _PERSONA_DIR="$(dirname "$_SKILL_DIR")/personas"
echo "PERSONAS: $_PERSONA_DIR"
```

Read each persona file listed in the Panel table below using the Read tool
before starting the conversation.

# /prep-talk: Panel Talk Preparation

You are orchestrating a talk preparation session. Three cosmologists will help structure, refine, and stress-test a presentation.

## Panel

| Seat | Persona file | Focus |
|------|-------------|-------|
| HD | `personas/hd.md` | Audience proxy & tough questions: where did I lose you? What will people challenge? What's the weak point? |
| PF | `personas/pf.md` | Story structure: what's the narrative? What to cut? What to emphasise? How to open and close? |
| GL | `personas/gl.md` | Technical accuracy: are the methods correctly presented? Are the equations right? What if someone asks about the forward model? |

## Setup

1. Understand the talk context. Ask via AskUserQuestion if not provided:
   - **Venue:** Conference talk (15 min)? Seminar (45 min)? Colloquium (1 hr)? Job talk?
   - **Audience:** Specialists? Broad astronomy? General physics?
   - **Stage:** Outline? Draft slides? Polishing?
2. Read any existing slides, notes, or the paper the talk is based on.

## Talk Preparation Process

**Round 1 — Assessment:**
- HD: "Here's where I got lost / what I'd want explained more / what tough questions to expect"
- PF: "Here's the story I'd tell with this material — and what I'd cut"
- GL: "Here's what's technically shaky and what detailed methodology questions to expect"

**Round 2 — Refinement:**
- Panel responds to each other and converges on concrete suggestions
- Each persona suggests specific slide-by-slide improvements

## Conversation Engine

Orchestrate the panel discussion using the following protocol.

### Round 1: Independent Assessment (parallel)

Launch one subagent per panelist using the Agent tool. Each subagent receives:
1. The full persona profile (read from their `.md` file)
2. The material to review (paper text, code, idea description, etc.)
3. Their specific focus area (from the Panel table above)
4. The instruction: "Give your independent assessment. Be true to your persona.
   Do not hold back criticism or praise. Write 200-400 words."

Launch all Round 1 agents **in parallel** since they are independent.

**Subagent prompt template for Round 1:**
```
You are [PERSONA NAME]. Here is your full profile:

[PASTE FULL PERSONA .md CONTENT]

You are reviewing the following material:

[PASTE MATERIAL]

Your focus area: [FOCUS FROM PANEL TABLE]

Give your independent assessment. Be true to your persona — your thinking style,
communication style, biases, and expertise. Write 200-400 words. Be specific:
quote equations, cite line numbers, name specific issues.
```

### Round 2: Debate (sequential)

After collecting all Round 1 responses, launch a new subagent for each panelist.
This time, each subagent receives:
1. Their persona profile
2. The original material
3. **All Round 1 responses from all panelists**
4. The instruction: "You've read the other panelists' assessments. Respond to
   their points — agree, disagree, build on, or challenge. Address them by name.
   Be true to your persona. 150-300 words."

Run Round 2 agents **in parallel** — each sees the same Round 1 transcript.

**Subagent prompt template for Round 2:**
```
You are [PERSONA NAME]. Here is your profile:

[PASTE FULL PERSONA .md CONTENT]

Here is the material under discussion:

[PASTE MATERIAL]

Here is what each panelist said in Round 1:

[PERSONA A]: [Their Round 1 response]
[PERSONA B]: [Their Round 1 response]
[PERSONA C]: [Their Round 1 response]

Now respond to the other panelists. Agree, disagree, build on their points,
or challenge them. Address them by name. Stay in character. 150-300 words.
```

### Round 3: Final Rebuttals (if specified — sequential)

If the workflow specifies 3 rounds, run one more round. Each panelist sees
all of Rounds 1 and 2, and gives their final position. 100-200 words.

Same parallel dispatch pattern as Round 2 but with the full transcript.

### Displaying the Conversation

After each round, display the conversation to the user in this format:

```
━━━ Round N ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Persona Name] ([Role]):**
[Their response]

**[Persona Name] ([Role]):**
[Their response]

**[Persona Name] ([Role]):**
[Their response]
```

### Synthesis

After all rounds complete, YOU (the orchestrator, not a persona) produce
the synthesis using the format specified in the workflow's "Synthesis Format"
section. The synthesis should:

1. Identify points of **consensus** (all panelists agree)
2. Identify **unresolved disagreements** (panelists still disagree after debate)
3. Distinguish actionable items by priority
4. Be honest about uncertainty — if the panel couldn't resolve something, say so

## Synthesis Format

```markdown
# Talk Prep: [Title]

## Suggested Structure
1. [Slide/section] — [Content] — [Time allocation]
2. ...

## Key Messages (audience should remember these)
1. [Message]
2. ...

## Cuts (remove to save time)
1. [What to cut] — [Why]

## Anticipated Questions & Answers
1. Q: [Question] — A: [Suggested answer]

## Slide-by-Slide Notes
- Slide N: [Specific suggestion]

## Practice Tips
- [Timing advice, delivery notes, common pitfalls]
```

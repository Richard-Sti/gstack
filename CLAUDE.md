# cosmo-panel development

## Commands

```bash
bun run build          # generate SKILL.md files from templates
bun run gen:skill-docs # same as build
bun test               # dry-run check that generated files are fresh
```

## Project structure

```
cosmo-panel/
├── personas/          # Persona profiles (the 7 cosmologists)
│   ├── gl.md          # Prof. GL — field-level inference, BORG, constrained sims
│   ├── jj.md          # Prof. JJ — forward modeling purist, hierarchical Bayesian
│   ├── pf.md          # Prof. PF — distinguished professor, gravity, big picture
│   ├── jv.md          # Prof. JV — Bayesian inference methodology, nested sampling
│   ├── hd.md          # Dr. HD — selection effects, bias testing, creative tests
│   ├── sg.md          # Dr. SG — simulations, galaxy formation, feedback physics
│   └── coder.md       # Industry-level coder — JAX, Julia, differentiable programming
├── review-paper/      # /review-paper workflow
├── review-code/       # /review-code workflow
├── bias-test/         # /bias-test workflow
├── write-paper/       # /write-paper workflow
├── check-physics/     # /check-physics workflow
├── compare-codes/     # /compare-codes workflow
├── brainstorm/        # /brainstorm workflow
├── respond-referee/   # /respond-referee workflow
├── prep-talk/         # /prep-talk workflow
├── forward-model/     # /forward-model workflow (Bayesian forward modeling)
├── research/          # /research workflow (full research: idea → paper + code)
├── scripts/           # Build tooling
│   └── gen-skill-docs.ts  # Template → SKILL.md generator
├── SKILL.md           # Generated root skill (don't edit directly)
├── SKILL.md.tmpl      # Root template (edit this)
└── package.json
```

## SKILL.md workflow

SKILL.md files are **generated** from `.tmpl` templates. To update:

1. Edit the `.tmpl` file (e.g., `review-paper/SKILL.md.tmpl`)
2. Run `bun run build`
3. Commit both the `.tmpl` and generated `.md` files

## How the conversation engine works

Each workflow:
1. Reads persona profiles from `personas/`
2. Dispatches parallel subagents for Round 1 (independent assessment)
3. Collects responses and dispatches Round 2 (debate — each persona responds to others)
4. Optionally runs Round 3 (final rebuttals)
5. Synthesises consensus, disagreements, and action items

Personas are designed with explicit biases and blind spots so the conversation
feels like a real research group meeting, not a checklist.

## Adding a new persona

1. Create `personas/<name>.md` with sections: Identity, Background, Thinking Style,
   Communication Style, Biases & Blind Spots, What They Catch
2. Reference it in workflow templates that should use it

## Adding a new workflow

1. Create `<workflow-name>/SKILL.md.tmpl` with YAML frontmatter + content
2. Include `{{COSMO_PREAMBLE}}` and `{{CONVERSATION_ENGINE}}` placeholders
3. Define the Panel table (which personas, their focus areas)
4. Define the Synthesis Format
5. Add the workflow to `scripts/gen-skill-docs.ts` in the `workflows` array
6. Run `bun run build`

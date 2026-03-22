# cosmo-panel

A team of seven AI cosmologists who review your papers, debug your code, check your physics, build forward models, and brainstorm new ideas — by debating each other. Each persona is modelled on a real researcher's expertise, thinking style, and writing voice.

## The Team

| Persona | Role | Strengths |
|---------|------|-----------|
| **Prof. GL** | Field-level inference pioneer | BORG, constrained sims, Bayesian field-level inference, HPC, survey systematics |
| **Prof. JJ** | Forward modeling purist | Hierarchical Bayesian models, HMC, physical forward models, systematic-free inference |
| **Prof. PF** | Distinguished professor, institute director | Modified gravity, dark energy, big picture, framework building, philosophy of cosmology |
| **Prof. JV** | Inference methodologist | Nested sampling, likelihood construction, Bayes factors, noise modeling, injection-recovery |
| **Dr. HD** | Emerging group leader | Selection effects, prior sensitivity, creative observational tests, distance ladder statistics |
| **Dr. SG** | Simulation expert | Hydro sims, galaxy formation, feedback physics, sim-observation comparison, stochasticity |
| **Coder** | Industry-level software engineer | JAX, Julia, differentiable programming, testing, performance, CI/CD |

Each persona has a detailed profile with: background, thinking style, communication style, biases & blind spots, **writing style** (derived from studying their actual papers), and what they catch.

## Workflows

### Debate Engine (review & discussion)

These workflows assemble a panel who read the material, give independent assessments, debate each other's points across multiple rounds, and converge on actionable output.

| Command | Panel | Rounds | Best for |
|---------|-------|--------|----------|
| `/review-paper` | JV + PF + HD | 3 | Pre-submission paper review |
| `/review-code` | Coder + GL + JV | 2 | Analysis code review |
| `/bias-test` | JV + HD + Coder | 3 | Inference pipeline validation |
| `/write-paper` | PF + GL + HD | 2 | Collaborative paper drafting |
| `/check-physics` | GL + JJ + PF | 2 | Derivation and physics verification |
| `/compare-codes` | Coder + JV + SG | 2 | Benchmark against existing codes |
| `/brainstorm` | PF + HD + SG | 3 | Research idea exploration |
| `/respond-referee` | PF + JJ + Coder | 2 | Craft referee report responses |
| `/prep-talk` | HD + PF + GL | 2 | Presentation preparation |

### Autonomous Engine (goal-driven work)

These workflows use a different engine: the panel works in iterative cycles (up to 5) until the objective is met. They **do not ask the user questions** — if a panelist is unsure about something, they ask the rest of the panel. They actively search the literature on arXiv and critically evaluate what they find.

| Command | Panel | Best for |
|---------|-------|----------|
| `/forward-model` | JJ + JV + HD + Coder | Building Bayesian forward models with proper selection effects |
| `/research` | **All 7 personas** | Full research cycle: idea → model → code → validation → paper |

The `/forward-model` workflow enforces a core principle: **sample latent parameters, always predict observables** (magnitudes, redshifts, fluxes — never distances), and properly account for selection effects. It includes a structured bias-test phase with injection-recovery validation. References: Kelly+2008, Stiskalek+2026.

The `/research` workflow is the most ambitious — it deploys all 7 personas across 6 structured phases:
1. **Brainstorm** (PF + GL + HD + SG) — sharpen the question, survey the literature
2. **Model design** (JJ + JV + HD + GL) — DAG, likelihood, priors, selection
3. **Physics verification** (GL + JJ + PF) — dimensional analysis, limiting cases, correctness
4. **Implementation** (Coder + JV + GL) — working, tested, differentiable code
5. **Validation** (JV + HD + Coder + SG) — injection-recovery, prior sensitivity, bias tests
6. **Paper writing** (PF + GL + HD + JJ) — complete LaTeX draft in each persona's authentic voice

The panel can go back to earlier phases if later work reveals issues — research is not linear.

## Install

### Option A: Symlink (recommended if you cloned the repo elsewhere)

```bash
mkdir -p ~/.claude/skills
ln -sf /path/to/cosmo-panel ~/.claude/skills/gstack

cd /path/to/cosmo-panel && bun run build
```

### Option B: Clone directly into skills

```bash
git clone https://github.com/Richard-Sti/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && bun run build
```

After installation, the workflows are available in **any** Claude Code session.

### Updating

```bash
cd ~/.claude/skills/gstack   # or wherever the repo lives
git pull
bun run build
```

Since skills are loaded at invocation time, updates take effect immediately.

## Usage

### Basic: invoke a workflow

Type the slash command and provide your material:

```
> /review-paper
> Please review my draft at paper/main.tex
```

```
> /write-paper
> Here are my results on the Cepheid distance ladder with proper selection
> modeling. The key finding is H0 = 72.3 +/- 1.1. Draft is in paper/main.tex.
```

```
> /bias-test
> Check my inference pipeline in src/likelihood.py and src/sampler.py
```

### Autonomous forward modeling

```
> /forward-model
> I want to build a hierarchical Bayesian model for inferring H0 from Cepheid
> period-luminosity relations. Observables: apparent magnitudes in multiple bands,
> periods, metallicities. Selection: magnitude-limited sample.
```

The panel (JJ + JV + HD + Coder) works autonomously through up to 5 cycles:
1. Design the DAG and generative model
2. Construct the likelihood, choose and justify priors
3. Cross-review each other's work, search arXiv for relevant methods
4. Write implementation code (JAX/NumPyro or Julia/Turing.jl)
5. Design injection-recovery validation tests
6. Return the complete model specification, code, and validation plan

### Full autonomous research

```
> /research
> I want to properly measure the local bulk flow from peculiar velocity data.
> The key challenge is accounting for selection effects in the magnitude-limited
> catalogue and the inhomogeneous Malmquist bias.
```

All 7 personas work through 6 phases — brainstorming the approach, designing the forward model, verifying the physics, writing code, running bias tests, and drafting the paper. They consult each other and search arXiv for relevant methods. You get back working code, a validation report, and a paper draft.

## How it works

### Debate Engine

1. The orchestrator reads the relevant persona profiles (from `personas/*.md`)
2. **Round 1:** Each panelist gives their independent assessment (parallel subagents)
3. **Round 2:** Each panelist responds to the others — agreeing, disagreeing, building on points
4. **Round 3** (some workflows): Final rebuttals
5. **Synthesis:** Consensus, disagreements, and prioritised action items

### Autonomous Engine

1. The orchestrator reads persona profiles and the material
2. **Phase A (Work):** Each panelist produces their contribution in parallel
3. **Phase B (Cross-Review):** Each panelist reviews the others' work, answers questions tagged `QUESTION FOR [NAME]:`
4. **Phase C (Integration):** The orchestrator merges work and applies agreed fixes
5. **Convergence check:** Is the objective met? If not, start another cycle
6. Repeat up to 5 cycles, then deliver final output

### Why it works

The personas are designed to **disagree** when they see things differently. JJ will insist on a proper forward model. JV will demand injection-recovery tests. HD will probe for selection effects and hidden prior assumptions. The Coder will flag non-differentiable steps and missing tests. PF will ask whether any of this actually matters for the science question. SG will check whether simulations agree. The result is a conversation that catches things a single reviewer would miss.

## Development

```bash
bun run build          # generate SKILL.md files from templates
bun run gen:skill-docs # same as build
bun test               # dry-run check that generated files are fresh
```

SKILL.md files are **generated** from `.tmpl` templates. To modify a workflow:
1. Edit the `.tmpl` file (e.g., `review-paper/SKILL.md.tmpl`)
2. Run `bun run build`
3. Commit both the `.tmpl` and generated `.md` files

See [CLAUDE.md](CLAUDE.md) for full project structure and contribution guide.

## License

MIT

# cosmo-panel

A team of six AI cosmologists who review your papers, debug your code, check your physics, and brainstorm new ideas — by debating each other.

## The Team

| Persona | Role | Strengths |
|---------|------|-----------|
| **Prof. Elena Vasquez** (Theorist) | Senior faculty, analytical cosmologist | Derivations, limiting cases, dimensional analysis |
| **Dr. Marcus Chen** (Coder) | Staff research software engineer | Performance, numerical stability, JAX/NumPy, testing |
| **Prof. James Okafor** (Senior) | Distinguished professor, 35yr experience | Literature, risk assessment, big picture |
| **Dr. Priya Sharma** (Postdoc) | 2nd-year postdoc, ML background | Fresh eyes, clarity, reproducibility |
| **Anonymous** (Referee) | Mid-career reviewer | Systematic review, statistical rigour |
| **Prof. Yuki Tanaka** (Competitor) | Rival group leader | Adversarial testing, alternative models |

## Workflows

Each workflow assembles a panel of three personas who:
1. Read the material independently
2. Give their assessment
3. Debate each other's points
4. Converge on actionable output

| Command | Panel | What it does |
|---------|-------|-------------|
| `/review-paper` | Referee + Theorist + Postdoc | Pre-submission paper review |
| `/review-code` | Coder + Senior + Competitor | Analysis code review |
| `/bias-test` | Referee + Competitor + Coder | Inference pipeline bias testing |
| `/write-paper` | Theorist + Senior + Postdoc | Collaborative paper drafting |
| `/check-physics` | Theorist + Competitor + Senior | Derivation and physics verification |
| `/compare-codes` | Coder + Referee + Competitor | Benchmark against existing codes |
| `/brainstorm` | Theorist + Postdoc + Competitor | Research idea exploration |
| `/respond-referee` | Senior + Theorist + Coder | Craft referee report responses |
| `/prep-talk` | Postdoc + Senior + Theorist | Presentation preparation |

## Install

```bash
# Clone into your Claude Code skills directory
git clone https://github.com/your-username/cosmo-panel.git ~/.claude/skills/cosmo-panel

# Build (generates SKILL.md files from templates)
cd ~/.claude/skills/cosmo-panel && bun run build
```

## How it works

Each persona has a detailed profile defining their background, thinking style, communication style, and explicit biases/blind spots. When you invoke a workflow:

1. The orchestrator reads the relevant persona profiles
2. **Round 1:** Each panelist gives their independent assessment (parallel subagents)
3. **Round 2:** Each panelist responds to the others — agreeing, disagreeing, building on points
4. **Round 3** (some workflows): Final rebuttals
5. **Synthesis:** Consensus, disagreements, and prioritised action items

The personas are designed to **disagree** when they see things differently. The Competitor actively tries to find weaknesses. The Postdoc asks "obvious" questions that turn out to be important. The Senior has seen it all before. The result is a conversation that catches things a single reviewer would miss.

## License

MIT

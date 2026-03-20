#!/usr/bin/env bun
/**
 * Generate SKILL.md files from .tmpl templates.
 *
 * Pipeline:
 *   read .tmpl → find {{PLACEHOLDERS}} → resolve from source → format → write .md
 *
 * Supports --dry-run: generate to memory, exit 1 if different from committed file.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(import.meta.dir, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Template Context ───────────────────────────────────────

interface TemplateContext {
  skillName: string;
  tmplPath: string;
}

// ─── Placeholder Resolvers ──────────────────────────────────

function generateCosmoPreamble(_ctx: TemplateContext): string {
  return `## Preamble

You are part of the **Cosmology Panel** — a system that simulates a team of
cosmologists with distinct expertise, career stages, and thinking styles. Each
workflow assembles a panel of 3 personas who read the material independently,
then debate each other's assessments across multiple rounds.

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

**Persona profiles** are in the \`personas/\` directory relative to the skill
installation. Read each persona's \`.md\` file before starting the conversation.

**Finding persona files:**

\`\`\`bash
_SKILL_DIR=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")
_PERSONA_DIR=""
[ -d "$_SKILL_DIR/../personas" ] && _PERSONA_DIR="$_SKILL_DIR/../personas"
[ -z "$_PERSONA_DIR" ] && [ -d ~/.claude/skills/gstack/personas ] && _PERSONA_DIR=~/.claude/skills/gstack/personas
[ -z "$_PERSONA_DIR" ] && _ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && [ -d "$_ROOT/.claude/skills/gstack/personas" ] && _PERSONA_DIR="$_ROOT/.claude/skills/gstack/personas"
[ -z "$_PERSONA_DIR" ] && _PERSONA_DIR="$(dirname "$_SKILL_DIR")/personas"
echo "PERSONAS: $_PERSONA_DIR"
\`\`\`

Read each persona file listed in the Panel table below using the Read tool
before starting the conversation.`;
}

function generateConversationEngine(_ctx: TemplateContext): string {
  return `## Conversation Engine

Orchestrate the panel discussion using the following protocol.

### Round 1: Independent Assessment (parallel)

Launch one subagent per panelist using the Agent tool. Each subagent receives:
1. The full persona profile (read from their \`.md\` file)
2. The material to review (paper text, code, idea description, etc.)
3. Their specific focus area (from the Panel table above)
4. The instruction: "Give your independent assessment. Be true to your persona.
   Do not hold back criticism or praise. Write 200-400 words."

Launch all Round 1 agents **in parallel** since they are independent.

**Subagent prompt template for Round 1:**
\`\`\`
You are [PERSONA NAME]. Here is your full profile:

[PASTE FULL PERSONA .md CONTENT]

You are reviewing the following material:

[PASTE MATERIAL]

Your focus area: [FOCUS FROM PANEL TABLE]

Give your independent assessment. Be true to your persona — your thinking style,
communication style, biases, and expertise. Write 200-400 words. Be specific:
quote equations, cite line numbers, name specific issues.
\`\`\`

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
\`\`\`
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
\`\`\`

### Round 3: Final Rebuttals (if specified — sequential)

If the workflow specifies 3 rounds, run one more round. Each panelist sees
all of Rounds 1 and 2, and gives their final position. 100-200 words.

Same parallel dispatch pattern as Round 2 but with the full transcript.

### Displaying the Conversation

After each round, display the conversation to the user in this format:

\`\`\`
━━━ Round N ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Persona Name] ([Role]):**
[Their response]

**[Persona Name] ([Role]):**
[Their response]

**[Persona Name] ([Role]):**
[Their response]
\`\`\`

### Synthesis

After all rounds complete, YOU (the orchestrator, not a persona) produce
the synthesis using the format specified in the workflow's "Synthesis Format"
section. The synthesis should:

1. Identify points of **consensus** (all panelists agree)
2. Identify **unresolved disagreements** (panelists still disagree after debate)
3. Distinguish actionable items by priority
4. Be honest about uncertainty — if the panel couldn't resolve something, say so`;
}

// ─── Resolver Registry ──────────────────────────────────────

const RESOLVERS: Record<string, (ctx: TemplateContext) => string> = {
  COSMO_PREAMBLE: generateCosmoPreamble,
  CONVERSATION_ENGINE: generateConversationEngine,
};

// ─── Template Processing ────────────────────────────────────

const GENERATED_HEADER = `<!-- AUTO-GENERATED from {{SOURCE}} — do not edit directly -->\n<!-- Regenerate: bun run gen:skill-docs -->\n`;

function processTemplate(tmplPath: string): { outputPath: string; content: string } {
  const tmplContent = fs.readFileSync(tmplPath, 'utf-8');
  const relTmplPath = path.relative(ROOT, tmplPath);
  const outputPath = tmplPath.replace(/\.tmpl$/, '');

  // Extract skill name from frontmatter for TemplateContext
  const nameMatch = tmplContent.match(/^name:\s*(.+)$/m);
  const skillName = nameMatch ? nameMatch[1].trim() : path.basename(path.dirname(tmplPath));
  const ctx: TemplateContext = { skillName, tmplPath };

  // Replace placeholders
  let content = tmplContent.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    const resolver = RESOLVERS[name];
    if (!resolver) throw new Error(`Unknown placeholder {{${name}}} in ${relTmplPath}`);
    return resolver(ctx);
  });

  // Check for any remaining unresolved placeholders
  const remaining = content.match(/\{\{(\w+)\}\}/g);
  if (remaining) {
    throw new Error(`Unresolved placeholders in ${relTmplPath}: ${remaining.join(', ')}`);
  }

  // Prepend generated header (after frontmatter)
  const header = GENERATED_HEADER.replace('{{SOURCE}}', path.basename(tmplPath));
  const fmEnd = content.indexOf('---', content.indexOf('---') + 3);
  if (fmEnd !== -1) {
    const insertAt = content.indexOf('\n', fmEnd) + 1;
    content = content.slice(0, insertAt) + header + content.slice(insertAt);
  } else {
    content = header + content;
  }

  return { outputPath, content };
}

// ─── Main ───────────────────────────────────────────────────

function findTemplates(): string[] {
  const templates: string[] = [];

  // Cosmology workflow skills
  const workflows = [
    'review-paper',
    'review-code',
    'bias-test',
    'write-paper',
    'check-physics',
    'compare-codes',
    'brainstorm',
    'respond-referee',
    'prep-talk',
  ];

  for (const w of workflows) {
    const p = path.join(ROOT, w, 'SKILL.md.tmpl');
    if (fs.existsSync(p)) templates.push(p);
  }

  // Root SKILL.md.tmpl (if it exists)
  const rootTmpl = path.join(ROOT, 'SKILL.md.tmpl');
  if (fs.existsSync(rootTmpl)) templates.push(rootTmpl);

  return templates;
}

let hasChanges = false;

for (const tmplPath of findTemplates()) {
  const { outputPath, content } = processTemplate(tmplPath);
  const relOutput = path.relative(ROOT, outputPath);

  if (DRY_RUN) {
    const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf-8') : '';
    if (existing !== content) {
      console.log(`STALE: ${relOutput}`);
      hasChanges = true;
    } else {
      console.log(`FRESH: ${relOutput}`);
    }
  } else {
    fs.writeFileSync(outputPath, content);
    console.log(`GENERATED: ${relOutput}`);
  }
}

if (DRY_RUN && hasChanges) {
  console.error('\nGenerated SKILL.md files are stale. Run: bun run gen:skill-docs');
  process.exit(1);
}

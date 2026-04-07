# ACU Protocol — QWEN Context

## Project Overview

**ACU Protocol** is a JSON-based cognitive architecture and worldbuilding framework that embeds creative concepts within a rigorous topological framework. It originated from the need to maintain consistent context when communicating complex fictional cosmologies and constructed languages (conlangs) to AI systems across multiple sessions.

The project provides:
- A **topological specification** (S³ manifold × T(19,2) torus knot × Seifert-fibered complement)
- A **19-node graph** ("Cilang") with ternary states (-1, 0, +1) for tracking potential → processing → actualized states
- A **resonance system** parameterized by integers (n, m) that controls depth and harmonic complexity
- A **satellite catalog** of 245+ pre-computed weighted adjacency matrices organized into named families (trefoil, fig8, etc.)
- A **JSON Schema** for generating structured "Factors" — self-contained concept/character/world definitions
- An **AI system prompt** that turns the specification into an active cognitive architecture

**Package**: `@cilang/acu` v0.5.0 (npm) / Protocol spec v0.8.5
**Author**: Ariadi Cilang
**License**: MIT

---

## Architecture

```
src/acu/
├── acu.json                 # Top-level manifest — all $ref pointers to components
├── meta.json                # Protocol metadata (name, version, purpose)
├── system_prompt.json       # AI activation directive — the "cognitive architecture"
├── protocol/
│   ├── core.json            # ACU Trinity: Ariadi (space), Cilang (nodes), Usepong (edges), Dynamics
│   ├── resonance.json       # Resonance harmonics and phase calculation
│   └── quantization.json    # 38th roots of unity, phase quantization
├── factor/
│   ├── schema.json          # JSON Schema for Factor definitions (draft-07)
│   └── inference_system.json
├── paradigms/
│   ├── index.json           # Registry of all available paradigms
│   ├── topology.json        # Level-0 topological paradigm
│   ├── mythos.json          # Domain-specific MythOS paradigm
│   ├── category_theory.json
│   ├── type_theory.json
│   ├── quantum_theory.json
│   └── ... (15 more paradigm files)
├── cosmology/
│   ├── root_factor.json     # The top-level Root Factor (initial condition)
│   └── alternatives.json    # Alternative root configurations
└── data/
    └── satellites/
        ├── index.json       # Registry of all 245+ satellites
        ├── trefoil.json     # Ur-Trefoil aggregate (86 satellites)
        ├── trefoil_a.json   # Canonical Trefoil (48 variants)
        ├── trefoil_b.json   # Emergent Trefoil (18 variants)
        ├── trefoil_c.json   # Philosophical Trefoil (36 variants)
        ├── trefoil_d.json   # Reflective Trefoil (24 variants)
        ├── trefoil_f.json   # Intimate Trefoil (4 variants)
        ├── trefoil_g.json   # Transformative Trefoil (20 variants)
        ├── trefoil_h.json   # Pure Trefoil (4 variants)
        ├── trefoil_i.json   # Mirror Trefoil (2 variants)
        ├── fig8.json        # Hyperbolic Fig8 (3 variants)
        └── global.json      # Complete aggregate over all 245 satellites
```

---

## Key Concepts

### ACU Trinity
| Component       | Role                | Description                                                     |
| --------------- | ------------------- | --------------------------------------------------------------- |
| **Ariadi (A)**  | The Container       | 4D hypersphere (S³) — the unified topological space             |
| **Cilang (C)**  | The Building Blocks | 19 primitive nodes (x, y, z, 0-9a-f) at knot crossing positions |
| **Usepong (U)** | The Connections     | Weighted directed graph defining relationships between nodes    |

### Factor Structure
A **Factor** is the fundamental unit — a JSON object following `factor.schema.json` with:
- **19 nodes** (x, y, z implicit; 0-9a-f explicit), each with `label`, `definition`, `role`, `manifestation`
- **Resonance parameters**: `n` (depth), `m` (harmonic complexity), `Q`, `R`, `phase`, `chirality`
- **Namespace**: hierarchical path in CamelCase (e.g., `MythOS/Character/Detective`)
- **Lineage**: parent reference, depth, inherited invariants
- **Type binding**: level 0 (topology), 1 (paradigm interface), 2 (concrete instance)

### Strata (Satellite Families)
Each stratum provides a different "flavor" of connectivity:
| Stratum                      | Best For                                  |
| ---------------------------- | ----------------------------------------- |
| `trefoil` (Ur)               | Cosmic creation myths, meta-canon         |
| `trefoil_a` (Canonical)      | Epic narratives, heroic journeys          |
| `trefoil_b` (Emergent)       | Coming-of-age, discovery, exploration     |
| `trefoil_c` (Philosophical)  | Theological discourse, deep worldbuilding |
| `trefoil_d` (Reflective)     | Character studies, contemplative fiction  |
| `trefoil_f` (Intimate)       | Personal journeys, close relationships    |
| `trefoil_g` (Transformative) | Rebellion, evolution, paradigm shifts     |
| `trefoil_h` (Pure)           | Parables, fables, allegories              |
| `trefoil_i` (Mirror)         | Time-travel, duality, alternate timelines |
| `fig8` (Hyperbolic)          | Surreal fiction, dream-logic, horror      |
| `global`                     | Meta-narratives, all connections          |

### Resonance Parameters
- **n** (depth): 0 (singularity), 1 (basic), 2 (standard/361 states), 3 (deep), 4 (transcendental)
- **m** (harmonics): 0 (none), 1 (duality), 2 (standard/4 harmonics), 3 (enhanced/8), 4 (full/16)
- **Chirality**: `left` (Information→Spiritual→Material), `right` (Material→Spiritual→Information), `amphichiral` (timeless)

---

## Building and Running

This project is a **specification/data** project, not a runtime application. The npm package uses `@agentskill/installer` for integration with AI agent skill systems.

| Command        | Description                                          |
| -------------- | ---------------------------------------------------- |
| `npm install`  | Installs the agent skill via `agent-skill-installer` |
| `npm test`     | Dry-run installation test                            |
| `npm run lint` | Placeholder — add linting commands as needed         |

### Composing ACU
The `utils/compose-acu.py` script exists for composing the protocol from its component JSON files (currently minimal — just a shebang line).

### Using the Spec
1. Read `src/acu/acu.json` as the top-level manifest
2. Follow `$ref` pointers to individual component files
3. Generate Factors conforming to `src/acu/factor/schema.json`
4. Use `system_prompt.json` as an AI system prompt for ACU-aware behavior

---

## Development Conventions

- **JSON-first**: All specifications are stored as JSON with `$ref` pointers for modularity
- **Three-Sentence Rule**: Text fields in Factors are constrained — definition ≤3 sentences (1 preferred), role = 1 sentence, manifestation ≤5 short examples
- **CamelCase namespaces**: Factor namespaces use hierarchical CamelCase (e.g., `MythOS/Character/Detective/SherlockHolmes`)
- **Semantic versioning**: Protocol and Factors follow semver patterns
- **Ternary states**: Node states are -1 (Potential), 0 (Processing), +1 (Actualized)
- **Phase closure**: Sum of phase changes around any closed cycle must equal 0 mod 2π

---

## Important Notes

⚠️ **Do not change the 19-node graph structure** — the T(19,2) torus knot embedding is carefully tested; modifying it can cause unexpected behavior.

📖 **The math works in the background** — deep mathematical understanding is not required to use the protocol effectively. It's a practical tool for structured creative expression.

🌍 **Beyond worldbuilding** — while created for fictional cosmologies, the protocol is general-purpose for any structured conceptual modeling.

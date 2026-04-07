#!/usr/bin/env python3
"""
ACU Agent Orchestrator
A conversational agent that builds creative works step by step using Factors.
Follows the ACU specification: everything is a Factor (cosmology, world, language, story).
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import jsonschema
from openai import OpenAI

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
ACU_SPEC_PATH = Path("acu.json")          # Your full ACU specification
FACTORS_DIR = Path("generated_factors")   # Where to save all Factors
MODEL = "gpt-4-turbo"                     # Or "gpt-3.5-turbo", or use Ollama
# For Ollama, change the client and model name accordingly.

# ----------------------------------------------------------------------
# Load ACU specification
# ----------------------------------------------------------------------
def load_acu_spec() -> Dict[str, Any]:
    with open(ACU_SPEC_PATH, "r") as f:
        return json.load(f)

ACU = load_acu_spec()
SYSTEM_PROMPT = ACU["system_prompt"]
FACTOR_SCHEMA = ACU["acu"]["factor"]["schema"]

# ----------------------------------------------------------------------
# LLM Client (OpenAI example)
# ----------------------------------------------------------------------
client = OpenAI()  # expects OPENAI_API_KEY in environment

def call_llm(user_message: str, system_override: str = None) -> str:
    """Call LLM and return raw text (expected to be JSON)."""
    messages = [
        {"role": "system", "content": system_override or json.dumps(SYSTEM_PROMPT)},
        {"role": "user", "content": user_message}
    ]
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        response_format={"type": "json_object"}  # Only works for OpenAI models that support it
    )
    return response.choices[0].message.content

# ----------------------------------------------------------------------
# Validation helpers
# ----------------------------------------------------------------------
def validate_factor(factor: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Return (is_valid, list_of_errors)."""
    errors = []
    # 1. JSON Schema validation
    try:
        jsonschema.validate(instance=factor, schema=FACTOR_SCHEMA)
    except jsonschema.ValidationError as e:
        errors.append(f"Schema error: {e.message}")
    
    # 2. Node completeness: 16 explicit nodes (0-9a-f) must be present
    explicit_nodes = [hex(i)[2:] for i in range(10)] + ['a','b','c','d','e','f']
    for node_id in explicit_nodes:
        if node_id not in factor.get("nodes", {}):
            errors.append(f"Missing explicit node: {node_id}")
    
    # 3. Resonance parameters
    res = factor.get("resonance", {})
    n = res.get("n")
    m = res.get("m")
    if not isinstance(n, int) or n < 0:
        errors.append("resonance.n must be a non‑negative integer")
    if not isinstance(m, int) or m < 0:
        errors.append("resonance.m must be a non‑negative integer")
    
    # 4. Phase is a 38th root of unity (simplified check: argument should be 2π * k/38)
    phase = res.get("phase", {})
    arg = phase.get("argument")
    if arg is not None:
        # Allow small floating error
        k_expected = round(arg * 19 / 3.141592653589793)  # arg = 2π * k/38 → k = arg * 19/π
        if abs(arg - 2 * 3.141592653589793 * k_expected / 38) > 0.01:
            errors.append(f"Phase argument {arg} is not a multiple of 2π/38")
    
    # 5. Chirality matches phase (simplified: left = -2π/3, right = +2π/3, amphichiral = 0 or π)
    chirality = res.get("chirality")
    if chirality and arg is not None:
        if chirality == "left" and abs(arg + 2.094) > 0.1:   # -2π/3 ≈ -2.094
            errors.append("Chirality 'left' requires phase argument ≈ -2π/3")
        elif chirality == "right" and abs(arg - 2.094) > 0.1:
            errors.append("Chirality 'right' requires phase argument ≈ +2π/3")
        elif chirality == "amphichiral" and not (abs(arg) < 0.1 or abs(arg - 3.14159) < 0.1):
            errors.append("Chirality 'amphichiral' requires phase argument 0 or π")
    
    return len(errors) == 0, errors

def auto_refine_factor(original_factor: Dict[str, Any], errors: List[str]) -> Dict[str, Any]:
    """Ask LLM to fix validation errors and return corrected Factor."""
    prompt = f"""The following Factor failed validation with these errors:
{chr(10).join(errors)}

Please correct the Factor and output only the corrected JSON. Keep the same namespace and overall structure, but fix the specific issues.
Original Factor:
{json.dumps(original_factor, indent=2)}
"""
    corrected_json = call_llm(prompt)
    try:
        corrected = json.loads(corrected_json)
        return corrected
    except json.JSONDecodeError:
        print("Auto‑refinement failed – LLM did not return valid JSON. Returning original.")
        return original_factor

# ----------------------------------------------------------------------
# Factor generation and saving
# ----------------------------------------------------------------------
def generate_factor(user_request: str, context_factors: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generate a Factor based on user request, optionally referencing existing Factors."""
    context_text = ""
    if context_factors:
        context_text = "\n\nYou may reference these existing Factors (by namespace) if relevant:\n"
        for f in context_factors:
            context_text += f"- {f.get('namespace')}: {f.get('definition', '')[:100]}\n"
    
    full_request = user_request + context_text + "\n\nOutput only valid JSON according to the ACU factor.schema."
    response_text = call_llm(full_request)
    try:
        factor = json.loads(response_text)
    except json.JSONDecodeError:
        print("LLM did not return valid JSON. Trying again...")
        # Simple retry: ask to output only JSON
        response_text = call_llm(full_request + " Output ONLY the JSON, no extra text.")
        factor = json.loads(response_text)
    return factor

def save_factor(factor: Dict[str, Any]) -> Path:
    """Save Factor to disk using its namespace as filename."""
    namespace = factor.get("namespace", "unknown")
    safe_name = namespace.replace("/", "_")
    path = FACTORS_DIR / f"{safe_name}.json"
    path.parent.mkdir(exist_ok=True)
    with open(path, "w") as f:
        json.dump(factor, f, indent=2)
    print(f"✅ Factor saved: {path}")
    return path

def load_existing_factors() -> List[Dict[str, Any]]:
    """Load all previously saved Factors from FACTORS_DIR."""
    factors = []
    if FACTORS_DIR.exists():
        for file in FACTORS_DIR.glob("*.json"):
            with open(file, "r") as f:
                factors.append(json.load(f))
    return factors

# ----------------------------------------------------------------------
# Workflow prompts (cosmology, world, language, story)
# ----------------------------------------------------------------------
WORKFLOW_PROMPTS = {
    "cosmology": """Create a Cosmology Factor (Level‑1, paradigm 'mythos') for a new creative universe.
    - Use stratum 'trefoil' (or 'trefoil_c' for philosophical depth).
    - Resonance n=3 (deep), m=2 (standard harmonics).
    - Node 0 (Observer) defines the point of view or creator role.
    - Node 3 (Asha) defines the invariant laws (magic, physics, morality).
    - Node a (OceanOfProbability) and b (ChaoticSpace) define the fundamental dichotomy.
    - Node f (LURD) describes the ultimate closure or fate of the cosmos.
    - Include a clear definition, role, and manifestation for each node.
    Output valid JSON.""",
    
    "world": """Create a World Factor (Level‑1 or Level‑2) that implements or references an existing Cosmology.
    - Choose paradigm: 'mythos' for observer‑centric world, 'dynamical_systems' for evolving geography, 'game_theory' for factional worlds.
    - Stratum: 'global' for general worlds, 'trefoil_g' for transformative worlds.
    - Resonance n=2 (standard), m=2.
    - Map nodes to: continents (1), nations/peoples (2), natural laws (3), resources (4), cultures (5), history (6), etc.
    - If a Cosmology Factor exists, include its namespace in type_context.
    Output valid JSON.""",
    
    "language": """Create a Language Factor (Level‑1 or Level‑2) using the 'phonetic' paradigm.
    - Stratum: 'trefoil_b' for emergent languages, 'trefoil_i' for mirror/dual languages.
    - Resonance n=2, m=2, chirality right.
    - Map nodes to phonetic classes (plosives, nasals, vowels, etc.) as in the 'MythOS/Schematic/Phonetic' example.
    - If a World Factor exists, reference it in type_context.spoken_in.
    Output valid JSON.""",
    
    "story": """Create a Story Factor (Level‑2) using the 'narrative_charter' paradigm.
    - Stratum: 'trefoil_a' for epic narratives, 'trefoil_f' for intimate stories.
    - Resonance n=2, m=2.
    - Map nodes to narrative beats: inciting event (0), rising action (1), complication (2), setback (3), insight (4), turning point (5), crisis (6), climax (7), denouement (8), resolution (9), theme (a), character arc (b), setting (c), conflict (d), dialogue (e), closure (f).
    - Reference existing Cosmology, World, and Language Factors in type_context.
    Output valid JSON."""
}

# ----------------------------------------------------------------------
# Main interactive loop
# ----------------------------------------------------------------------
def main():
    print("\n🌀 ACU Agent Orchestrator 🌀")
    print("I help you build a cosmos, world, language, and story – all as Factors.")
    print("Type 'exit' to quit.\n")
    
    # Load any existing Factors for context
    existing = load_existing_factors()
    if existing:
        print(f"Loaded {len(existing)} existing Factor(s).")
    
    while True:
        print("\nWhat would you like to create?")
        print("  [1] Cosmology (foundation)")
        print("  [2] World (setting)")
        print("  [3] Language (phonetic system)")
        print("  [4] Story (narrative)")
        print("  [5] List existing Factors")
        print("  [6] Exit")
        choice = input("> ").strip()
        
        if choice == "6" or choice.lower() == "exit":
            print("Goodbye. The 19 nodes resonate on.")
            break
        
        if choice == "5":
            for f in existing:
                print(f"  {f.get('namespace')} – {f.get('definition', '')[:60]}")
            continue
        
        mode_map = {"1": "cosmology", "2": "world", "3": "language", "4": "story"}
        if choice not in mode_map:
            print("Invalid choice. Please select 1-6.")
            continue
        
        mode = mode_map[choice]
        print(f"\n--- Creating {mode.upper()} Factor ---")
        
        # Optionally, let the user provide additional details
        extra = input("Any specific details or themes? (press Enter to skip): ").strip()
        user_request = WORKFLOW_PROMPTS[mode]
        if extra:
            user_request += f"\n\nAdditional user direction: {extra}"
        
        # Generate
        print("Generating Factor...")
        factor = generate_factor(user_request, context_factors=existing)
        
        # Validate
        valid, errors = validate_factor(factor)
        attempt = 1
        while not valid and attempt <= 2:
            print(f"❌ Validation failed (attempt {attempt}):")
            for e in errors:
                print(f"  - {e}")
            if attempt == 1:
                print("Attempting auto‑refinement...")
                factor = auto_refine_factor(factor, errors)
                valid, errors = validate_factor(factor)
            else:
                print("Auto‑refinement failed again. You may manually edit the Factor later.")
                break
            attempt += 1
        
        if valid:
            print("✅ Factor validated.")
            save_factor(factor)
            existing.append(factor)  # add to context for next steps
            print("\n--- Factor Summary ---")
            print(f"Namespace: {factor.get('namespace')}")
            print(f"Definition: {factor.get('definition', '')[:200]}")
            print("----------------------")
        else:
            print("❌ Could not produce a valid Factor. Please try again with more specific directions.")
            # Optionally save the invalid version for debugging
            debug_path = FACTORS_DIR / "debug_invalid.json"
            with open(debug_path, "w") as f:
                json.dump(factor, f, indent=2)
            print(f"Invalid Factor saved to {debug_path} for inspection.")

if __name__ == "__main__":
    main()
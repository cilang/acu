# **Cilang Framework**

**Abstract**—Cilang Framework is a novel computational and philosophical framework that uses an invariant 16-vertex, 35-edge topological structure. By representing diverse concepts as **Factor** in a **Cilang Space**, Cilang enables cross-domain probabilistic computation, causal inference, and systematic knowledge integration while maintaining mathematical rigor and creative flexibility.

---

## 1. Introduction

Traditional approaches to knowledge and modeling are fragmented: scientific frameworks cannot capture consciousness, philosophical systems are often untestable, and fictional universes lack formal rigor. Cilang addresses this fragmentation through a radical unification: all conceptual entities are represented as **Factor** occupying a shared **Cilang Space**, where relational structure defines meaning more than domain content.

### 1.1 Core Innovation

The key insight is that relational topology encodes meaning. A string vibration, conscious experience, or magical spell can share the same structural relationships in Cilang Space, differing only in their semantic interpretation. The **Cilang Space** is the multidimensional stage where these Factors interact, propagate, and synthesize knowledge.

### 1.2 Origin

When we consider _Flower of Life_ as something with **19 Primitives**, using _Category Theory_ those **19 Primitives** can be divided into Morphism and Objects.

| Cilang | Object | Morphism | Note |
| --- | --- | --- | --- |
| Space | w_[0-9a-f]_t | x,y,z | 4D coordinates (x,y,z,w) on S³ with x²+y²+z²+w²=1 |
| Topology | cilang_[0-9a-f]_t | IN, OUT, REC | Apply Graph Theory then it become 16-vertex and 35-edge |

### 1.3 Terminology

- Factor: A concrete instance populated with actual data (an "implementation")
- Cilang: Node or vertex representing a system component
- Usepong: Edge representing relationships between components
- Actualization: The process of moving from imaginary potential (w=-1) to full manifestation (w=+1)
- Quantization: The value of `q` which is 2n+1 due to balanced ternary constraint, by default Cilang using `q=137` for fun

---

## 2. Architectural Foundation

1. SPACE: 4D coordinates (x,y,z,w) on S³ with x²+y²+z²+w²=1
2. LAYERS: w = -1 (Imaginary), 0 (Idea), +1 (Real)
3. MULTIPLEX: w ∈ {w0, ..., w15}
4. QUANTIZATION: Q = 19ⁿ
5. Distribution: [f(n), f(n)+1, f(n)] where f(n) = (19ⁿ - 1)/3
6. TOPOLOGY: 16 Cilang and 35 Usepong

### 2.1 The Invariant Topology

Every Cilang Factor implements a consistent 16-vertex, 35-edge directed graph:

```dot

strict digraph Factor {
    style = filled;
    color = lightgray;
    node [shape = circle; style = filled; color = lightgreen;];
    edge [color = darkgray;];
    label = "{{Name}}";
    comment = "{{description}}";

    cilang_a_t [label = "{{Name}}.receive({{title}})";comment = "{{description}}";];
    cilang_0_t [label = "{{Name}}.meta({{meta}})";comment = "{{description}}";];
    cilang_b_t [label = "{{Name}}.send({{title}})";comment = "{{description}}";];
    cilang_1_t [label = "{{Name}}.r1({{title}})";comment = "{{description}}";];
    cilang_2_t [label = "{{Name}}.r2({{title}})";comment = "{{description}}";];
    cilang_4_t [label = "{{Name}}.r4({{title}})";comment = "{{description}}";];
    cilang_8_t [label = "{{Name}}.r8({{title}})";comment = "{{description}}";];
    cilang_7_t [label = "{{Name}}.r7({{title}})";comment = "{{description}}";];
    cilang_5_t [label = "{{Name}}.r5({{title}})";comment = "{{description}}";];
    cilang_3_t [label = "{{Name}}.r3({{title}})";comment = "{{description}}";];
    cilang_6_t [label = "{{Name}}.r6({{title}})";comment = "{{description}}";];
    cilang_9_t [label = "{{Name}}.r9({{title}})";comment = "{{description}}";];
    cilang_c_t [label = "{{Name}}.dispatch({{title}})";comment = "{{description}}";];
    cilang_d_t [label = "{{Name}}.commit({{title}})";comment = "{{description}}";];
    cilang_e_t [label = "{{Name}}.serve({{title}})";comment = "{{description}}";];
    cilang_f_t [label = "{{Name}}.exec({{title}})";comment = "{{description}}";];

    cilang_a_t -> cilang_0_t [label = "IN"; comment = "{{description}}";];
    cilang_0_t -> cilang_b_t [label = "OUT"; comment = "{{description}}";];

    cilang_a_t -> cilang_c_t [label = "REC"; comment = "{{description}}";];
    cilang_b_t -> cilang_c_t [label = "REC"; comment = "{{description}}";];

    cilang_a_t -> cilang_b_t [label = "REC"; comment = "{{description}}";];

    cilang_0_t -> cilang_3_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_6_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_9_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_1_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_2_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_4_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_8_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_7_t [label = "REC"; comment = "{{description}}";];
    cilang_0_t -> cilang_5_t [label = "REC"; comment = "{{description}}";];

    cilang_1_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];
    cilang_2_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];
    cilang_4_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];
    cilang_8_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];
    cilang_7_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];
    cilang_5_t -> cilang_d_t [label = "REC"; comment = "{{description}}";];

    cilang_3_t -> cilang_e_t [label = "REC"; comment = "{{description}}";];
    cilang_6_t -> cilang_e_t [label = "REC"; comment = "{{description}}";];
    cilang_9_t -> cilang_e_t [label = "REC"; comment = "{{description}}";];

    cilang_1_t -> cilang_2_t [label = "REC"; comment = "{{description}}";];
    cilang_2_t -> cilang_4_t [label = "REC"; comment = "{{description}}";];
    cilang_4_t -> cilang_8_t [label = "REC"; comment = "{{description}}";];
    cilang_8_t -> cilang_7_t [label = "REC"; comment = "{{description}}";];
    cilang_7_t -> cilang_5_t [label = "REC"; comment = "{{description}}";];
    cilang_5_t -> cilang_1_t [label = "REC"; comment = "{{description}}";];

    cilang_3_t -> cilang_6_t [label = "REC"; comment = "{{description}}";];
    cilang_6_t -> cilang_9_t [label = "REC"; comment = "{{description}}";];
    cilang_9_t -> cilang_3_t [label = "REC"; comment = "{{description}}";];

    cilang_c_t -> cilang_f_t [label = "REC"; comment = "{{description}}";];
    cilang_d_t -> cilang_f_t [label = "REC"; comment = "{{description}}";];
    cilang_e_t -> cilang_f_t [label = "REC"; comment = "{{description}}";];
}

````

![Image](cilang.svg)

To reach the aesthetic in the image we need to put some "constraint = false" into the graphviz digraph so it become:

```dot
strict digraph Factor {
    style = filled;
    color = lightgray;
    node [shape = circle; style = filled; color = lightgreen;];
    edge [color = darkgray;];
    label = "{{Name}}";
    comment = "{{description}}";

    cilang_0_t [label = "{{Name}}.meta({{description}})";comment = "Abstract: {{description}}";shape = doublecircle;color = darkgray;];
    cilang_1_t [label = "{{Name}}.r1({{description}})";comment = "Initiation: {{description}}";color = darkgreen;];
    cilang_2_t [label = "{{Name}}.r2({{description}})";comment = "Response: {{description}}";color = darkgreen;];
    cilang_4_t [label = "{{Name}}.r4({{description}})";comment = "Integration: {{description}}";color = darkgreen;];
    cilang_8_t [label = "{{Name}}.r8({{description}})";comment = "Reflection: {{description}}";color = darkgreen;];
    cilang_7_t [label = "{{Name}}.r7({{description}})";comment = "Consolidation: {{description}}";color = darkgreen;];
    cilang_5_t [label = "{{Name}}.r5({{description}})";comment = "Propagation: {{description}}";color = darkgreen;];
    cilang_3_t [label = "{{Name}}.r3({{description}})";comment = "Thesis: {{description}}";color = darkblue;];
    cilang_6_t [label = "{{Name}}.r6({{description}})";comment = "Antithesis: {{description}}";color = darkblue;];
    cilang_9_t [label = "{{Name}}.r9({{description}})";comment = "Synthesis: {{description}}";color = darkblue;];
    cilang_a_t [label = "{{Name}}.receive({{description}})";comment = "Potential: {{description}}";shape = invtriangle;color = darkred;];
    cilang_b_t [label = "{{Name}}.send({{description}})";comment = "Manifest: {{description}}";shape = triangle;color = darkred;];
    cilang_c_t [label = "{{Name}}.dispatch({{description}})";comment = "Why-Who: {{description}}";shape = doublecircle;color = darkred;];
    cilang_d_t [label = "{{Name}}.commit({{description}})";comment = "What-How: {{description}}";shape = doublecircle;color = darkgreen;];
    cilang_e_t [label = "{{Name}}.serve({{description}})";comment = "When-Where: {{description}}";shape = doublecircle;color = darkblue;];
    cilang_f_t [label = "{{Name}}.exec({{description}})";comment = "Which-Closure: {{description}}";shape = doublecircle;color = lightgray;];

    cilang_a_t -> cilang_0_t [label = "IN"; comment = "{{description}}"; color = darkred; constraint = false;];
    cilang_0_t -> cilang_b_t [label = "OUT"; comment = "{{description}}"; color = darkred;];
    cilang_a_t -> cilang_c_t [label = "REC"; comment = "{{description}}"; color = darkred; dir = both;];
    cilang_b_t -> cilang_c_t [label = "REC"; comment = "{{description}}"; color = darkred; dir = both;];
    cilang_a_t -> cilang_b_t [label = "REC"; comment = "{{description}}"; color = darkred; dir = both; style = dashed; constraint = false;];

    cilang_0_t -> cilang_3_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];
    cilang_0_t -> cilang_6_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];
    cilang_0_t -> cilang_9_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];
    cilang_0_t -> cilang_1_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_0_t -> cilang_2_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_0_t -> cilang_4_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_0_t -> cilang_8_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_0_t -> cilang_7_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_0_t -> cilang_5_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];

    cilang_1_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_2_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_4_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_8_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_7_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_5_t -> cilang_d_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both;];

    cilang_3_t -> cilang_e_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];
    cilang_6_t -> cilang_e_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];
    cilang_9_t -> cilang_e_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both;];

    cilang_1_t -> cilang_2_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];
    cilang_2_t -> cilang_4_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];
    cilang_4_t -> cilang_8_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];
    cilang_8_t -> cilang_7_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];
    cilang_7_t -> cilang_5_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];
    cilang_5_t -> cilang_1_t [label = "REC"; comment = "{{description}}"; color = darkgreen; dir = both; style = dashed; constraint = false;];

    cilang_3_t -> cilang_6_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both; style = dashed; constraint = false;];
    cilang_6_t -> cilang_9_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both; style = dashed; constraint = false;];
    cilang_9_t -> cilang_3_t [label = "REC"; comment = "{{description}}"; color = darkblue; dir = both; style = dashed; constraint = false;];

    cilang_c_t -> cilang_f_t [label = "OUT"; comment = "{{description}}"; color = darkred; dir = both;];
    cilang_d_t -> cilang_f_t [label = "OUT"; comment = "{{description}}"; color = darkgreen; dir = both;];
    cilang_e_t -> cilang_f_t [label = "OUT"; comment = "{{description}}"; color = darkblue; dir = both;];
}
```

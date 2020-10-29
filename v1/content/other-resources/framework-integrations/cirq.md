---
title: 'Cirq integration'
summary: Quantum Engine integration with Cirq
weight: 1
---

[Cirq](https://github.com/quantumlib/Cirq) is a Python library for writing, manipulating, and optimizing quantum circuits and running them against quantum computers and simulators. This page describes how to convert circuits between Cirq and [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core).

### Circuits {#circuits}

Cirq circuits can be converted to/from [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) circuits.
This allows you to pass Cirq circuits to [Z-Quantum interfaces](../../interfaces) 
such as backends and estimators, and to implement instances of these interfaces using Cirq.
Additionally it allows you to convert circuits to/from [other frameworks](../../framework-integrations).

```python
from zquantum.core.circuit import Circuit
import cirq

cirq_circuit = cirq.Circuit(cirq.H(cirq.LineQubit(0))) 

# Convert a cirq circuit to a Z-Quantum circuit
zircuit = Circuit(cirq_circuit)

# Convert back to a cirq circuit
converted_cirq_circuit = zircuit.to_cirq()
```

Note that in order to use `z-quantum-core` within a [workflow step](../../quantum-engine/steps), you will need to include it as an import in your workflow:
```yaml
imports:
- name: z-quantum-core
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
```

Additionally, your step must specify that it requires this import:
```yaml
  config:
    runtime:
      language: python3
      imports: [z-quantum-core, ...]
```
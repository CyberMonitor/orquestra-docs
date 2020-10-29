---
title: 'PyQuil integration'
summary: Quantum Engine integration with Pyquil
weight: 2
---

(PyQuil)[https://github.com/rigetti/pyquil] is a Python library for quantum programming using Quil, the quantum instruction language developed at Rigetti Computing.

This page shows how to use [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) to [convert PyQuil circuits](#circuits) and [run simulations on the Quantum Virtual Machine (QVM)](#backends).

### Circuits {#circuits}

PyQuil circuits can be converted to/from [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) circuits.
This allows you to pass PyQuil circuits to [Z-Quantum interfaces](../../interfaces) 
such as backends and estimators, and to implement instances of these interfaces using PyQuil.
Additionally it allows you to convert circuits to/from [other frameworks](../../framework-integrations).
```python
from zquantum.core.circuit import Circuit
import pyquil


pyquil_circuit = pyquil.Program(pyquil.gates.H(0))


# Convert a cirq circuit to a Z-Quantum circuit
zircuit = Circuit(pyquil_circuit)

# Convert back to a cirq circuit
converted_pyquil_circuit = zircuit.to_pyquil()
```
### Backends {#backends}

The [Rigetti Forest Quantum Virtual Machine (QVM)](https://github.com/rigetti/qvm) can be run locally as a backend. To use it in steps such as [`optimize_variational_circuit`](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/steps/optimizers.py), you will need to include `qe-forest` as well as `z-quantum-core` as imports:
```yaml
imports:
- name: qe-forest
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/qe-qiskit.git"
    branch: "master"
- name: z-quantum-core
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
```

You will also need your step to specify that it requires these imports:

```yaml
  config:
    runtime:
      language: python3
      imports: [z-quantum-core, qe-forest, ...]
```

Then the QVM can be used as a backed by providing a backend specification such as:
```yaml
  - backend_specs: |
      {
        "module_name": "qeforest.simulator",
        "function_name": "ForestSimulator",
        "device_name": "wavefunction-simulator",
        "n_samples": 1000
      }
    type: string
```
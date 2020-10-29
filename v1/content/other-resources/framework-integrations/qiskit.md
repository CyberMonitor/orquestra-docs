---
title: 'Qiskit integration'
summary: Quantum Engine integration with Qiskit
weight: 3
---

[Qiskit](https://qiskit.org/) is an open source SDK for working with quantum computers at the level of pulses, circuits and algorithms.

This page shows how to use [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) to:
* [Convert Qiskit circuits](#circuits)
* [Run circuits on IBMQ devices and Qiskit simulators](#backends)
* [Use Qiskit optimizers](#optimizers)

### Circuits {#circuits}

Qiskit circuits can be converted to/from [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) circuits.
This allows you to pass Qiskit circuits to [Z-Quantum interfaces](../../interfaces) 
such as backends and estimators, and to implement instances of these interfaces using Qiskit.
Additionally it allows you to convert circuits to/from [other frameworks](../../framework-integrations).

```python
from zquantum.core.circuit import Circuit
import qiskit

qiskit_circuit = qiskit.QuantumCircuit(1)
qiskit_circuit.h(0)

# Convert a qiskit circuit to a Z-Quantum circuit
zircuit = Circuit(qiskit_circuit)

# Convert back to a qiskit circuit
qiskit_circuit = zircuit.to_qiskit()
```

### Backends {#backends}

Two backends are currently integrated via [`qe-qiskit`](https://github.com/zapatacomputing/qe-qiskit): the [`QiskitBackend`](https://github.com/zapatacomputing/qe-qiskit/blob/master/src/python/qeqiskit/backend/backend.py) provides access to IBMQ through your IBMQ account while the [`QiskitSimulator`](https://github.com/zapatacomputing/qe-qiskit/blob/master/src/python/qeqiskit/simulator/simulator.py) runs the Qiskit Aer simulators locally.

To use either IBMQ or Qiskit Aer as a backend in steps such as [`optimize_variational_circuit`](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/steps/optimizers.py), you will need to include `qe-qiskit` as well as `z-quantum-core` and `qe-openfermion` as imports:
```yaml
imports:
- name: qe-qiskit
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/qe-qiskit.git"
    branch: "master"
- name: z-quantum-core
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: qe-openfermion
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/qe-openfermion.git"
    branch: "master"
```

You will also need your step to specify that it requires these imports:

```yaml
  config:
    runtime:
      language: python3
      imports: [z-quantum-core, qe-openfermion, qe-qiskit, ...]
```

To use the IBMQ backend, provide a backend specification such as the example below. Note that you must inserting your IBMQ API Token.
```yaml
  - backend_specs: |
      {
        "module_name": "qeqiskit.backend",
        "function_name": "QiskitBackend",
        "device_name": "ibmq_qasm_simulator",
        "n_samples": 8192,
        "readout_correction": true,
        "optimization_level": 2,
        "api_token": "<your IBMQ API Token>"
      }
    type: string
```

The Qiskit Aer simulators can be similarly used. Note that an IBMQ API Token is not required because the simulator is run locally on the worker node.
```yaml
  - backend_specs: |
      {
        "module_name": "qeqiskit.simulator",
        "function_name": "QiskitSimulator",
        "device_name": "qasm_simulator",
        "n_samples": 100  
      }
    type: string
```

### Optimizers {#optimizers}

Qiskit optimizers are provided via the [`QiskitOptimizer`](https://github.com/zapatacomputing/qe-qiskit/blob/master/src/python/qeqiskit/optimizer/optimizer.py) class in [`qe-qiskit`](https://github.com/zapatacomputing/qe-qiskit).

To use the Qiskit optimizers in a step such as [`optimize-variational-circuit`](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/steps/optimizers.py), you will need to include `qe-qiskit`, `qe-openfermion`, and `z-quantum-core` as imports for your step (see above).

The Qiskit optimizers can then be specified in the optimizer spec, such as:
```yaml
    - optimizer_specs: |
        {
          "module_name": "qeqiskit.optimizer.optimizer",
          "function_name": "QiskitOptimizer",
          "method": "SPSA"
          "options": {"max_iter": 500}
        }
      type: string
```
Allowed choices for `method` are `SPSA`, `ADAM`, and `AMSGRAD`.

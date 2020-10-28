---
title: Framework integrations 
summary: Description of integrations with quantum computing frameworks.
weight: 4
---

Available quantum computing frameworks provide many valuable components, such as classes and functions representing circuits, backends, and optimizers.
Because these frameworks in general not compatible, it can be difficult to swap components from different frameworks.

To make it easier to interchangebly use components from across frameworks, [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) provides a compatibility layer that integrates widely used frameworks.
This page walks through the key features of integrations with [Cirq](#cirq), [Pyquil](#pyquil), and [Qiskit](#qiskit).

Note that while the framework integrations provided by Z-Quantum are used in many of the [Orquestra tutorials](../../tutorials), you can also deploy code written with your preferred framework directly as a [workflow step](../../quantum-engine/steps).

## Cirq {#cirq}

Cirq circuits can be converted to/from Z-Quantum circuits:
```python
from zquantum.core.circuit import Circuit
import cirq

cirq_circuit = cirq.Circuit(cirq.H(cirq.LineQubit(0))) 

# Convert a cirq circuit to a Z-Quantum circuit
zircuit = Circuit(cirq_circuit)

# Convert back to a cirq circuit
converted_cirq_circuit = zircuit.to_cirq()
```

## Pyquil {#pyquil}

### Circuits

Pyquil circuits can be converted to/from Z-Quantum circuits:
```python
from zquantum.core.circuit import Circuit
import pyquil


pyquil_circuit = pyquil.Program(pyquil.gates.H(0))


# Convert a cirq circuit to a Z-Quantum circuit
zircuit = Circuit(pyquil_circuit)

# Convert back to a cirq circuit
converted_pyquil_circuit = zircuit.to_pyquil()
```
### Backends

The Rigetti Forest QVM can be run locally as a backend. To use it in steps such as [`optimize_variational_circuit`](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/steps/optimizers.py), you will need to include `qe-forest` as well as `z-quantum-core` as imports:
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

## Qiskit {#qiskit}

### Circuits

Qiskit circuits can be converted to/from Z-Quantum circuits:
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

### Backends

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

### Optimizers

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

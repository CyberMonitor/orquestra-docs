---
title: Framework integrations 
summary: Description of integrations with quantum computing frameworks.
weight: 4
---

To enable users to use different quantum computing frameworks interchangably, compatibility layer is provided through `z-quantum-core` and various framework-specific components.

# Qiskit {#qiskit}

## Circuits

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

## Backends

## Optimizers

# Cirq {#cirq}

Cirq circuits can be converted to/from Z-Quantum circuits:
```python
from zquantum.core.circuit import Circuit
import cirq

cirq_circuit = cirq.Circuit()
cirq_circuit.append(cirq.H(cirq.LineQubit))

# Convert a cirq circuit to a Z-Quantum circuit
zircuit = Circuit(cirq_circuit)

# Convert back to a cirq circuit
converted_cirq_circuit = zircuit.to_cirq()
```

# Pyquil {#pyquil}

## Circuits

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
## Backends

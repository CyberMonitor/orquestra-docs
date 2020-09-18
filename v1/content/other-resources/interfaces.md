---
title: Interfaces
summary: Orquestra Interfaces allow you to integrate workflows across quantum backends, simulators, optimizers and cost functions.
weight: 2
math: "true"
markup: "mmark"
---

One of the biggest strengths of Orquestra is its modularity. Integrating new backends, optimizers, compilers, etc. does not require changing the core code – it requires only creating a new module that conforms to existing interfaces and therefore can be used across the whole platform.

## Interfaces in Orquestra

Orquestra interfaces are defined in the [`z-quantum-core` repository](https://github.com/zapatacomputing/z-quantum-core/tree/master/src/python/zquantum/core/interfaces).

Right now Orquestra defines the following interfaces:
- `QuantumBackend`
- `QuantumSimulator` (subclass of `QuantumBackend`)
- `Optimizer`
- `CostFunction`
- `Estimator`
- `Ansatz`

## Integrating with interfaces

### How to integrate your own code
In order to integrate code which fits the interfaces, you need to create a class which inherits after the appropriate interface. All you need to do is implement the methods required by the interface. In some cases implementing a new backend might also require installing additional software and therefore need a special docker container to work.

You might find very basic examples of such integrations in the [`mock_objects`](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/interfaces/mock_objects.py) file in [`z-quantum-core`](https://github.com/zapatacomputing/z-quantum-core). Note that these are created only for testing purposes, but you'll find links to other implementations in appropriate sections.


### Using the Interface

Once you've done your integration, there are two ways you can use it in your template.
The first one is obvious – you can simply import from the module you've just created, create a python object and voila!

However, this means that the class that implements the interface will be hardcoded in your component and using another one will require changing the component.
That's why you can use `create_object` function from `zquantum.core.utils`. It takes a dictionary with specification of the object you'd like to create and creates it inside the component. Take a look at the following example workflow step and the code it calls:

```yaml
- name: use-any-backend
  config:
    runtime:
      type: python3
      imports: [z-quantum-core]
      parameters:
        file: z-quantum-core/steps/main_script.py
        function: any_backend
  inputs:
   backend-specs: '{"module_name": "zquantum.core.interfaces.mock_objects", "function_name": "MockQuantumSimulator", "n_samples": 1000}'
    type: string
```

```python
from zquantum.core.utils import create_object

def any_backend(backend_specs):
    backend = create_object(backend_specs)
```

`backend-specs` dictionary should have the following fields:
- `module_name` - it specifies from which python module you want to import.
- `function_name` - it specifies the function you want to use to create your object.
- others - it will treat any other entries in the dictionary as keyword arguments for your object.

For example, for the `MockSimulator` it might look like this:

```yaml
- backend-specs: "{'module_name': 'zquantum.core.interfaces.mock_objects', 'function_name': 'MockQuantumSimulator', 'n_samples': 1000}"
```

### QuantumBackend and QuantumSimulator

`QuantumBackend` and `QuantumSimulator` are interfaces which allow you to integrate different backends for running quantum circuits. The main difference between the two of them is that `QuantumSimulator` allows using a wavefunction representation of a quantum state.

You can find [the interface definition here](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/interfaces/backend.py). Currently available integrations are:

- [qHiPSTER](https://github.com/zapatacomputing/qe-qhipster)
- [Forest QVM](https://github.com/zapatacomputing/qe-forest)
- [qulacs](https://github.com/zapatacomputing/qe-qulacs)


### Optimizer

Optimizer is an interface that allows using different optimizers within Orquestra, [here you can find the interface definition](https://github.com/zapatacomputing/z-quantum-core/blob/dev/src/python/zquantum/core/interfaces/optimizer.py).

All the currently implemented optimizers live in the [z-quantum-optimizers repository](https://github.com/zapatacomputing/z-quantum-optimizers):

- grid search - brute-force approach checking all the values from a grid.
- scipy optimizers - integration with `scipy.minimize` optimizers.
- qiskit optimizers - integration with `ADAM`, `AMSGRAD` and `SPSA`.
- CMA-ES - Covariance Matrix Adaptation Evolution Strategy.


### Cost functions

In Orquestra we also have interfaces for the cost functions that are being minimized by the optimizers. Cost functions can vary in their complexity – from just calling a simple python function in `BasicCostFunction` to execution and evaluation of quantum circuits on any backend using `AnsatzBasedCostFunction`, but for evaluation they all should need just an array of numerical parameters. This interface can also be used for calculating gradients of given cost function – all cost functions support finite differences method by default.

Right now the following cost functions are implemented in Orquestra:
- **[`BasicCostFunction`](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/cost_function.py):** it allows to use an arbitrary python function as cost function we want to minimize.
- **[`AnsatzBasedCostFunction`](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/cost_function.py):** cost function which evaluates an operator using given ansatz, useful for variational quantum algorithms.
- **[`QCBMCostFunction`](https://github.com/zapatacomputing/z-quantum-qcbm/blob/master/src/python/zquantum/qcbm/cost_function.py):** builds off of the `AnsatzBasedCostFunction`, but tuned towards the Quantum Circuit Born Machine algorithm.

### Estimators 

An `Estimator` is used to estimate the expectation value of an observable. 
As input, an `Estimator` takes a `QuantumBackend`, a circuit $$C$$, and an observable $$O$$ and returns an estimate of the expectation value. 
Specifically, say the state $$\ket{\psi}$$ is prepared by the circuit $$C$$. 
Then, the `Estimator` returns an estimate of $$\braket{\psi \vert O \vert \psi}$$, the expectation value of the observable on the state prepared by the input circuit. 
There are also optional inputs, depending on the `Estimator` being used.  

Here is a list of the `Estimator` implementations currently available on Orquestra: 

- **[`BasicEstimator`](https://github.com/zapatacomputing/z-quantum-core/blob/dev/src/python/zquantum/core/estimator.py#L43):** 
Estimates expectation values with standard estimation techniques. 
- **[`ExactEstimator`](https://github.com/zapatacomputing/z-quantum-core/blob/dev/src/python/zquantum/core/estimator.py#L108):** 
Exactly computes expectation value. The backend must be a `QuantumSimulator`.  

### Ansatzes 

An `Ansatz` is used to produce circuits that all belong to a similar family and all contain similar structures and are commonly used in variational quantum algorithms. Ansatzes can take various things as input (ranging from device specifications to hamiltonians), but all ansatzes share the same goal of producing Quantum Circuits.

There are two very important properties of `Ansatz`, the first being the `parameterized_circuit` attribute. This will return a parameterized version of the Quantum Circuit that matches the current attributs of the ansatz such as the `number_of_qubits` and `number_of_layers`. Since producing these circuits can sometimes be a costly operation, the `parameterized_circuit` is cached and reproduced when certain attributes of the ansatz are modified. The second important property of all ansatzes is the `get_executable_circuit` method. Since parameterizable circuits are not supported by every ansatz, this is a way to get a non-parameterized circuit that still adheres to the given ansatz.

Here is a list of the `Ansatz` implementations currently available on Orquestra: 

- **[`QAOAFarhiAnsatz`](https://github.com/zapatacomputing/z-quantum-qaoa/blob/dev/src/python/zquantum/qaoa/farhi_ansatz.py#L15):** 
Ansatz class representing QAOA ansatz as described in "A Quantum Approximate Optimization Algorithm" by E. Farhi and J. Goldstone (https://arxiv.org/abs/1411.4028)
- **[`QCBMAnsatz`](https://github.com/zapatacomputing/z-quantum-qcbm/blob/dev/src/python/zquantum/qcbm/ansatz.py#L15):** 
An ansatz implementation used for running the Quantum Circuit Born Machine.
- **[`SingletUCCSDAnsatz`](https://github.com/zapatacomputing/z-quantum-vqe/blob/dev/src/python/zquantum/vqe/singlet_uccsd.py#L14):** 
Ansatz class representing Singlet UCCSD Ansatz.
---
title: Variational Loops
Summary: Implementing variational loops in Orquestra
weight: 1
---

Variational Quantum Algorithms (VQA) such as Varational Quantum Eigensolver (VQE) or Quantum Approximate Optimization Algorithm (QAOA) rely on hybrid approach to quantum computing.

A key component of variational quantum algorithms are variational loops. This section will explain how you can implement variational loops in Orquestra.

## Variational loop

The variational loop is a method where we use a quantum computer to evaluate only the cost function we want to minimize.

Before you start you need to define the following:

1. Parametrizable circuit
2. A cost function to minimize
3. A classical optimizer

Variational loops usually involves the following steps:

1. Initialize the circuit with the parameters
2. Run the circuit on a quantum computer
3. Based on the results of the circuit evaluate the cost function
4. Run the optimization algorithm to find new set of parameters
5. Go back to step 1.


## Variational loops in Orquestra

Let's see how to use the variational loop in the Orquestra.

### Template

Variational loops can be accessed through the `optimize-variational-circuit` template. You can find it in the [z-quantum-optimizers](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/templates/optimizers.yaml) repository.

The `optimize-variational-circuit` template requires the following inputs:
  - `ansatz-specs` (parameter)
  - `backend-specs` (parameter)
  - `optimizer-specs` (parameter)
  - `cost-funcion-specs` (parameter)
  - `initial-parameters` (artifact)
  - `qubit-operator` (artifact)

`ansatz-specs`, `backend-specs`, `optimizer-specs`, and `cost-funcion-specs` are dictionaries which specify what ansatz, backend, optimizer, and cost function respectively will be used. You can read more about them on the [interfaces page](../interfaces/).

`initial-parameters` contains the initial parameters for the optimization algorithm.
`qubit-operator` represents a `QubitOperator` or `IsingOperator` objects from the `openfermion` library, which are used for calculating the cost function.


### Python code

To better understand how variational loop can be used inside the template, take a look at the python code inside the [optimize-variational-circuit](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/templates/optimizers.yaml) (slightly simplified for clarity):

```python            
import os
from zquantum.optimizers.utils import save_optimization_results
from zquantum.core.circuit import load_circuit_template_params, save_circuit_template_params, load_parameter_grid, load_circuit_connectivity
from qeopenfermion import load_qubit_operator
from zquantum.core.utils import create_object, load_noise_model
import json

# 1. Load the input data
initial_parameters = load_circuit_template_params('initial_parameters.json')
operator = load_qubit_operator('qubitop.json')

# 2. Define optimizer
optimizer_specs = {'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B'}
optimizer = create_object(optimizer_specs)

# 3. Define backend
backend_specs = {'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}
backend = create_object(backend_specs)

# 4 . Define ansatz
ansatz_specs = {'module_name': 'zquantum.qaoa.farhi_ansatz', 'function_name': 'QAOAFarhiAnsatz', 'number_of_layers': 2, 'cost_hamiltonian': operator}
ansatz = create_object(ansatz_specs)

# 5. Define cost function
cost_function_specs = {'module_name': 'zquantum.core.cost_function', 'function_name': 'AnsatzBasedCostFunction', 'target_operator': operator, 'ansatz': ansatz, 'backend': backend}
cost_function = create_object(cost_function_specs)

# 6. Find the optimal parameters
opt_results = optimizer.minimize(cost_function, initial_parameters)

# 7. Save the results
save_optimization_results(opt_results, 'optimization-results.json')
save_circuit_template_params(opt_results.opt_params, 'optimized_parameters.json')
```

Let's see what happens in each step:

1. Load input objects from files to python objects.
2. Type and parameters of the optimizer are specified by entries in the dictionary and the python object conforming to this specification is created.
3. Type and parameters of the backend are specified by entries in the dictionary and the python object conforming to this specification is created.
4. Type and parameters of the ansatz are specified by entries in the dictionary and the python object conforming to this specification is created.
5. Type and parameters of the cost function are specified by entries in the dictionary and the python object conforming to this specification is created.
6. Uses objects defined earlier to find the optimal parameters
7. Saves the results of the optimization to the files.

The whole variational loop happens in step 5 and is handled by the optimizer.

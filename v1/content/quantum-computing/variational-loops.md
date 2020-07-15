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
  - `backend-specs` (parameter)
  - `optimizer-specs` (parameter)
  - `ansatz` (artifact)
  - `initial-parameters` (artifact)
  - `qubit-operator` (artifact)

`backend-specs` and `optimizer-specs` are dictionaries which specify what backend and optimizer will be used. You can read more about them on the [interfaces page](https://www.orquestra.io/docs/qe/quantum-computing/interfaces/).

`ansatz` corresponds to a dictionary representing given ansatz. Such dictionary should have the following fields (though it may have additional fields):
  - `ansatz_type` - specifies what type of the ansatz we want to used
  - `ansatz_module` - name of the module where the function for building this module resides
  - `ansatz_func` - name of the function for building the ansatz
  - `ansatz_kwargs` - a dictionary containing all the keyword arguments required by function defined in `ansatz_func`.

`initial-parameters` contains the initial parameters for the optimization algorithm.
`qubit-operator` represents a `QubitOperator` or `IsingOperator` objects from the `openfermion` library, which are used for calculating the cost function.


### Python code

To better understand how variational loop can be used inside the template, take a look at the python code inside the [optimize-variational-circuit](https://github.com/zapatacomputing/z-quantum-optimizers/blob/master/templates/optimizers.yaml) (slightly simplified for clarity):

```python
import os
from zquantum.optimizers.utils import save_optimization_results
from zquantum.core.cost_function import EvaluateOperatorCostFunction
from zquantum.core.circuit import load_circuit_template, load_circuit_template_params, save_circuit_template_params
from qeopenfermion import load_qubit_operator
from zquantum.core.utils import create_object
import json

# 1. Load the input data
ansatz = load_circuit_template('ansatz.json')
initial_parameters = load_circuit_template_params('initial_parameters.json')
operator = load_qubit_operator('qubitop.json')

# 2. Define optimizer
optimizer_specs = {'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B'}
optimizer = create_object(optimizer_specs)

# 3. Define backend
backend_specs = {'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}
backend = create_object(backend_specs)

# 4. Define cost function
cost_function = EvaluateOperatorCostFunction(operator, ansatz, backend)

# 5. Find the optimal parameters
opt_results = optimizer.minimize(cost_function, initial_parameters)

# 6. Save the results
save_optimization_results(opt_results, 'optimization-results.json')
save_circuit_template_params(opt_results.opt_params, 'optimized_parameters.json')
```

Let's see what happens in each step:

1. Load input objects from files to python objects.
2. Type and parameters of the optimizer are specified by entries in the dictionary and the python object conforming to this specification is created.
3. Type and parameters of the backend are specified by entries in the dictionary and the python object conforming to this specification is created.
4. A cost function object is created. Since we want to find parameters of the ansatz which minimize the expectation value of the operator, we use `EvaluateOperatorCostFunction`, designed for that purpose.
5. Uses objects defined earlier to find the optimal parameters
6. Saves the results of the optimization to the files.

The whole variational loops happens in step 5 and is handled by the optimizer.

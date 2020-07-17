---
title: Interfaces
summary: Orquestra Interfaces allow you to integrate workflows across quantum backends, simulators, optimizers and cost functions.
weight: 2
---

One of the biggest strengths of Orquestra is its modularity. Integrating new backends, optimizers, compilers, etc. does not require changing the core code – it requires only creating a new module that conforms to existing interfaces and therefore can be used across the whole platform.

## Interfaces in Orquestra

Orquestra interfaces are defined in the [`z-quantum-core` repository](https://github.com/zapatacomputing/z-quantum-core/tree/master/src/python/zquantum/core/interfaces).

Right now Orquestra defines the following interfaces:
- `QuantumBackend`
- `QuantumSimulator` (subclass of `QuantumBackend`)
- `Optimizer`
- `CostFunction`

## Integrating Backends & Optimizers

### How to integrate your own code
In order to integrate code which fits the some of the interfaces, you need to create a class which inherits after appropriate interface. All you need to do is just implement the methods specified by the interface. In some cases implementing a new backend might also require installing additional software and therefore need a special docker container to work.



### Using integration

Once you've done your integration, there are two ways you can use it in your template.
The first one is obvious – you can simply import from the module you've just created, create a python object and voila!

However, this means that the backend/optimizer will be hardcoded in your template and using another one will require changes to the template.
That's why you can use `create_object` function from `zquantum.core.utils`. It takes a dictionary with specification of the object you'd like to create and creates it inside the template. Take a look at the following example:

```yaml
templates:
- name: use-any-backend
  parent: generic-task
  inputs:
    parameters:
    - name: backend-specs
    - name: command
      value: bash main_script.sh
    artifacts:
    - name: main-script
      path: /app/main_script.sh
      raw:
        data: |
          python3 python_script.py
    - name: python-script
      path: /app/python_script.py
      raw:
        data: |
          from zquantum.core.utils import create_object
          backend_specs = {{inputs.parameters.backend-specs}}
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

### Integrated backends

Each backend integration lives in a separate repository:

- [qHiPSTER](https://github.com/zapatacomputing/qe-qhipster)
- [Forest QVM](https://github.com/zapatacomputing/qe-forest)
- [qulacs](https://github.com/zapatacomputing/qe-qulacs)


### Integrated optimizers

All the currently implemented optimizers live in the [z-quantum-optimizers repository](https://github.com/zapatacomputing/z-quantum-optimizers):

- grid search - brute-force approach checking all the values from a grid.
- scipy optimizers - integration with `scipy.minimize` optimizers.
- CMA-ES - Covariance Matrix Adaptation Evolution Strategy


### Cost functions

In Orquestra we also have interfaces for the cost functions that are being minimized by the optimizers.

Right now the following cost functions are implemented in Orquestra:
- [`BasicCostFunction`](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/cost_function.py) – it allows to use an arbitrary python function as cost function we want to minimize.
- [`EvaluateOperatorCostFunction`](https://github.com/zapatacomputing/z-quantum-core/blob/master/src/python/zquantum/core/cost_function.py) - cost function which evaluates an operator using given ansatz and backend, useful for variational quantum algorithms.
- [`QCBMCostFunction`](https://github.com/zapatacomputing/z-quantum-qcbm/blob/master/src/python/zquantum/qcbm/cost_function.py) - similar to the `EvaluateOperatorCostFunction`, but tuned towards the Quantum Circuit Born Machine algorithm.

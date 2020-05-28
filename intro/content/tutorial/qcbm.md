---
title: 2. Probabilistic Modeling with Quantum Circuits
description: Find a quantum distribution which generates the Bars and Stripes dataset with a Quantum Circuit Born Machine
---

## Introduction

This tutorial will walk through an implementation of a quantum circuit Born machine (QCBM) using Quantum Engine to find a distribution that generates the Bars and Stripes (BAS) dataset that fit in a 2 × 2 pixel image.

## The quantum circuit Born machine
A quantum circuit Born machine (QCBM) is an unsupervised generative model which represents the probability distribution of a dataset as a quantum state. [A quantum circuit Born machine (QCBM)](https://www.nature.com/articles/s41534-019-0157-8) model was proposed as an approach to load arbitrary probability distributions in noisy intermediate-scale quantum (NISQ) devices.

In simple terms, given a dataset, the QCBM is used to obtain a good approximation to the target distribution defined by that dataset. That is, a distribution such that when we sample randomly from it, it is very likely to return the elements in the set or similar elements, and unlikely to return anything different.

The way a QCBM builds a distribution is by starting with a vector of parameters (or angles for our gates), and preparing a wave function using a quantum circuit model. The process of training the QCBM model gives us a new vector of parameters that generates a good approximation to the aforementioned distribution.

The probability of an outcome **x** is given by Born's rule

![](../img/born-rule.png)

## The dataset: Bars and Stripes
In this tutorial we use a QCBM to find a distribution that generates a particular dataset. This dataset is the Bars and Stripes (BAS) dataset. The BAS dataset is widely used to study generative models for unsupervised machine learning. It is comprised by the black and white images inside an *m* × *n* rectangle which contain any number of either horizontal stripes or vertical bars. The 6-element set corresponding to *m* = 2 and *n* = 2 is illustrated below.

![The Bars and Stripes Dataset](../img/bars-and-stripes.png)*The Bars and Stripes (BAS) dataset inside a 2 × 2 pixel image.*

The way we parametrize the elements of the BAS dataset is with four qubits, one corresponding to each of the pixels in the images (taken from top to bottom, and each row from left to right). More specifically, for the 2 × 2 example above, the BAS patters are represented by the bitstrings 0000, 1100, 0101, 1111, 0011, and 1010. For simplicity, we can choose to map them to their corresponding computational basis states.

## The cost function: Clipped negative log-likelihood
To train the model, we need a cost function which tells us if the distribution we are obtaining is similar to the target distribution or not.

As it is very common in machine learning, we'll train the model by minimizing the Kullback-Leibler (KL) divergence, which measures the distance between two distributions. This is equivalent to minimizing the negative log-likelihood

![](../img/cost-function.png)

where the summation index *d* runs over the number of BAS patters in the training data set, and *D* is the size of the dataset.

Since the formula contains the logarithm of the probability, we want to avoid cases in which the probability is zero. For this reason, we replace the very small values of the probability by some fixed small value, and get the following variant:

![](../img/modified-cost-function.png)

## The training process

The training process of the QCBM is referred to as the data-driven quantum circuit learning (DDQCL) algorithm. It consists of the following steps:
1. Initialize the circuit with random parameters.
2. Prepare the initial state, execute the quantum circuit to obtain the QCBM model and perform measurements in the computational basis.
3. Compare the distribution obtained to that one of the dataset.
4. Update the parameters using an optimizer.

Steps 2-4 get repeated until we achieve a small enough error. Notice that Steps 1 and 2 are quantum steps, while 3, and 4 are classical.

![](../img/quantum-classical.png)
*The training process.*

## The ansatz

The circuit for the QCBM in this tutorial has a combination of single qubit and entangling gates. In the image below, at the left of the circuit, we show the graph of pairs of qubits which are connected with *XX* (a.k.a. Mølmer-Sørensen) gates. We call this graph the *topology* of the circuit. Note that in order to explore the full space, we need this graph to be connected. In this workshop, we chose the all-to-all topology, which connects each pair of vertices.

![](../img/ansatz-all.png)
*A circuit with the all-to-all topology.*

For illustration, in the figure below we see a circuit with a different topology, the star topology, which connects qubit 1 to all the other ones.

![](../img/ansatz-star.png)
*A circuit with the star topology.*

## The results: A Bars and Stripes distribution

As we'll be able to see when we run the workflow, the QCBM model is able to accurately represent the distribution corresponding to the BAS dataset, by attaching a high probability close to *1/6* for each of the BAS patterns, and a low probability (close to 0) for the remaining patterns.

![The DDQCL Process](../img/training.png)*We start with a random distribution coming from the random initialization of the circuit parameters. After the training process, we end with a distribution that gives the BAS patterns high probabilities, and all the other patterns low probabilities.*

## Composing a workflow to generate a QCBM for BAS patterns

In the next steps we will write the code necessary to build and train this QCBM model in Orquestra. The code consists of three main parts:
- `ansatz.py` which builds the circuit.
- `optimization.py` which trains the QCBM model.
- `optimize-qcbm-circuit.yaml` which creates the dataset and runs the entire workflow.

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `qcbm`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help

This repository will be where you build your resource. [This GitHub repo](https://github.com/zapatacomputing/z-quantum-qcbm) can be used as a reference for how the `qcbm` resource should look like throughout the tutorial.

**2. Add python code to the repository**

Now we will add the bulk of the workflow, which is the Python code that trains the model. We need two files, one for defining the ansatz, and one for training and optimizing the model.

Using either the GitHub UI or by cloning your repo and using the command line, create a file `src/python/zquantum/qcbm/ansatz.py`. In that file, add the following function for defining the ansatz, with the corresponding topology.

```python
import numpy as np
from zquantum.core.circuit import Circuit, Qubit, Gate

def get_single_qubit_layer(n_qubits, params, single_qubit_gate):
    """Builds a layer of single-qubit gates acting on all qubits in a quantum circuit.

    Args:
        n_qubits (int): number of qubits in the circuit.
        params (numpy.array): parameters of the single-qubit gates.
        single_qubit_gate (str): the gate to be applied to each qubit.

    Returns:
        Circuit: a zquantum.core.circuit.Circuit object
    """

    output = Circuit()
    qubits = [Qubit(qubit_index) for qubit_index in range(n_qubits)]
    output.qubits = qubits
    for qubit_index in range(n_qubits):
        output.gates.append(Gate(single_qubit_gate,[qubits[qubit_index]], [params[qubit_index]]))

    return output


def get_all_topology(n_qubits, params, static_entangler):
    """Builds an entangling layer according to the all-to-all topology.

    Args:
        n_qubits (int): number of qubits in the circuit.
        params (numpy.array): parameters of the circuit.
        static_entangler (str): gate specification for the entangling layer.

    Returns:
        Circuit: a zquantum.core.circuit.Circuit object
    """

    assert(params.shape[0] == int((n_qubits*(n_qubits-1))/2))
    output=Circuit()
    qubits = [Qubit(qubit_index) for qubit_index in range(n_qubits)]
    output.qubits = qubits
    i = 0
    for qubit1_index in range(0, n_qubits-1):
        for qubit2_index in range(qubit1_index+1,n_qubits):
            output.gates.append(Gate(static_entangler,[qubits[qubit1_index],qubits[qubit2_index]],[params[i]]))
            i+=1
    return output


def get_entangling_layer(n_qubits, params, static_entangler, single_qubit_gate, topology):
    """Builds an entangling layer in the circuit.

    Args:
        n_qubits (int): number of qubits in the circuit.
        params (numpy.ndarray): parameters of the circui.t
        static_entangler (str): gate specification for the entangling layer.
        single_qubit_gate (str): gate specification for the single-qubit transformation.
        topology (str): topology (str): describes topology of qubits connectivity.

    Returns:
        Circuit: a zquantum.core.circuit.Circuit object
    """
    circuit = Circuit()
    if topology == 'all':
        circuit += get_all_topology(n_qubits, params, static_entangler)
    return circuit


def build_qcbm_circuit_ion_trap(n_qubits, input_params, single_qubit_gate, static_entangler, topology='all'):
    """Builds a qcbm ansatz circuit, using the ansatz in https://advances.sciencemag.org/content/5/10/eaaw9918/tab-pdf (Fig.2 - top).

    Args:
        n_qubits (int): number of qubits initialized for circuit.
        input_params (numpy.array): input parameters of the circuit (1d array).
        single_qubit_gate(str): Gate specification for the single-qubit layer (L0).
        static_entangler(str): Gate specification for the entangling layers (L1, L2, ... , Ln).
        topology (str): describes topology of qubits connectivity.

    Returns:
        Circuit: the qcbm circuit
    """

    assert(n_qubits > 1)

    # Extract params of layer zero to 1d array of size 2*n_qubits (Rx layer and Rz layer)
    n_params_layer_zero = 2*n_qubits
    params_layer_zero = np.take(input_params, list(range(2*n_qubits)))
    assert(params_layer_zero.shape[0] == n_params_layer_zero)
    assert(params_layer_zero.ndim == 1)

    n_params_per_layer = int((n_qubits*(n_qubits-1))/2)

    if (input_params.shape[0]-2*n_qubits)%n_params_per_layer==0:
        n_layers = int((input_params.shape[0]-2*n_qubits)/n_params_per_layer) # number of entangling layers
    else:
        raise RuntimeError("Incomplete layers are not supported yet.")
        #In thise case we should:
        # 1. redefine n_layers
        #n_layers = int((input_params.shape[0]-n_qubits)/n_params_per_layer)+1
        # 2. create a 0s array to fill the last layer
        # fill = np.zeros(n_params_per_layer-(input_params.shape[0]-n_qubits)%n_params_per_layer)
        # 3. fill the last layer
        # input_params = np.append(input_params,fill)
    assert(n_layers > 0)

    # Extract params of entangling layers to 1d array and then reshape to 2d array (matrix) of size n_layers*n_params_per_layer
    params_from_input = np.take(input_params, list(range(2*n_qubits,input_params.shape[0])))
    params=np.reshape(params_from_input, (n_layers, n_params_per_layer))
    assert(params.shape[1] == n_params_per_layer)

    assert(single_qubit_gate in ['Rx'])

    assert(static_entangler in ['XX'])

    assert(topology in ['all'])

    # Initialize quantum circuit
    circuit = Circuit()

    # Add first layer of single-qubit gates Rx
    circuit += get_single_qubit_layer(n_qubits,params_layer_zero[0:n_qubits], single_qubit_gate)
    # Add second layer of single-qubit gates Rz
    circuit += get_single_qubit_layer(n_qubits,params_layer_zero[n_qubits:], 'Rz')

    # Creating a counter system to iterate through the circuit (over the entangling layers)
    counter = 0
    for n in range(0,n_layers):
        circuit += get_entangling_layer(n_qubits, params[counter], static_entangler, single_qubit_gate, topology)
        counter += 1

    return circuit


def generate_random_initial_params(n_qubits, n_layers=1, topology='all', min_val=0., max_val=1., n_par=0, seed=None):
    """Generate random parameters for the QCBM circuit (iontrap ansatz).

    Args:
        n_qubits (int): number of qubits in the circuit.
        n_layers (int): number of entangling layers in the circuit. If n_layers=-1, you can specify a custom number of parameters (see below).
        topology (str): describes topology of qubits connectivity.
        min_val (float): minimum parameter value.
        max_val (float): maximum parameter value.
        n_par (int): specifies number of parameters to be generated in case of incomplete layers (i.e. n_layers=-1).
        seed (int): initialize random generator

    Returns:
        numpy.array: the generated parameters, stored in a 1D array.
    """
    gen = np.random.RandomState(seed)
    assert(topology == 'all')
    n_params_layer_zero = 2*n_qubits
    n_params_per_layer = int((n_qubits*(n_qubits-1))/2)

    if n_layers==-1:
        n_params=n_par
    else:
        assert(n_layers>0)
        if n_par!=0:
            raise ValueError("If n_layers is specified, n_par is automatically computed.")
        n_params = n_params_layer_zero+n_layers*n_params_per_layer
    params = gen.uniform(min_val, max_val, n_params)
    return(params)
```

Now, in the same fashion, create a file `src/python/zquantum/qcbm/optimization.py` with the following function. Note that inside this function, we are defining the cost function.

```python
import copy
from zquantum.core.bitstring_distribution import evaluate_distribution_distance
from zquantum.core.utils import ValueEstimate
from .ansatz import build_qcbm_circuit_ion_trap

def optimize_variational_qcbm_circuit(n_qubits, single_qubit_gate,
    static_entangler, topology, epsilon, initial_params, distance_measure, 
    backend, optimizer, target_bitstring_distribution,**kwargs):
    """Optimize a quantum circuit Born machine (QCBM).

    Args:
        n_qubits (int): The number of qubits in the qcbm circuit
        single_qubit_gate (str): See build_qcbm_circuit_ion_trap. 
        static_entangler (str): See build_qcbm_circuit_ion_trap.
        topology (str): See build_qcbm_circuit_ion_trap.
        epsilon (float):  See evaluate_distribution_distance.
        initial_params: Initial parameters for the optimization
        distance_measure (str): See evaluate_distribution_distance.
        backend (zquantum.core.interfaces.backend.QuantumSimulator): the backend to run the circuits on 
        optimizer (zquantum.core.interfaces.optimizer.Optimizer): the optimizer used to manage the optimization process
        target_bitstring_distribution : See evaluate_distribution_distance.
    Returns:
    """
    distribution_history = []

    def cost_function(params):
        # Build the ansatz circuit
        qcbm_circuit = build_qcbm_circuit_ion_trap(
                    n_qubits, params, single_qubit_gate, static_entangler,
                    topology=topology)

        measured_distr = backend.get_bitstring_distribution(qcbm_circuit)

        distribution_history.append(measured_distr)

        value_estimate = ValueEstimate(evaluate_distribution_distance(
                                            target_bitstring_distribution,
                                            measured_distr,
                                            distance_measure,
                                            epsilon=epsilon))

        return value_estimate.value

    optimization_results = optimizer.minimize(cost_function, initial_params)

    for i, evaluation in enumerate(optimization_results['history']):
        evaluation['bitstring_distribution'] = distribution_history[i].distribution_dict

    return optimization_results
```

**3. Adding a `setup.py`**

Create a file `src/setup.py` with the following contents:

```python
import setuptools
import os

setuptools.setup(
    name="quantum-qcbm",
    version="0.1.0",
    author="Zapata Computing, Inc.",
    author_email="info@zapatacomputing.com",
    description="QCBM package for Orquestra.",
    packages=setuptools.find_namespace_packages(include=['zquantum.*']),
    package_dir={'' : 'python'},
    classifiers=(
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ),
    install_requires=[
        'z-quantum-core',
    ]
)
```
**4. Adding `templates`**

Create a file `templates/qcbm-optimization.yaml` with the following contents:

```yaml
spec:
  templates:

  - name: generate-random-qcbm-params
    parent: generic-task
    inputs:
      parameters:
      - name: n-qubits
      - name: n-layers
        default: "1"
      - name: topology
        default: "all"
      - name: min-val
        default: "0."
      - name: max-val
        default: "1."
      - name: n-par
        default: "0"
      - name: seed
        default: "None"
      - name: command
        value: python3 main_script.py
      artifacts:
      - name: main-script
        path: /app/main_script.py
        raw:
          data: |
            from zquantum.qcbm.ansatz import generate_random_initial_params
            from zquantum.core.circuit import save_circuit_template_params

            n_qubits = {{inputs.parameters.n-qubits}}
            n_layers = {{inputs.parameters.n-layers}}
            topology = "{{inputs.parameters.topology}}"
            min_val = {{inputs.parameters.min-val}}
            max_val = {{inputs.parameters.max-val}}
            n_par = {{inputs.parameters.n-par}}
            seed = {{inputs.parameters.seed}}

            parameters = generate_random_initial_params(n_qubits, n_layers=n_layers, 
                  topology=topology, min_val=min_val, max_val=max_val, n_par=n_par, seed=seed)

            save_circuit_template_params(parameters, "parameters.json")
    outputs:
      artifacts:
      - name: parameters
        path: /app/parameters.json
      

  - name: optimize-variational-qcbm-circuit
    parent: generic-task
    inputs:
      parameters:
      - name: n-qubits
      - name: single-qubit-gate
      - name: static-entangler
      - name: topology
        default: "all"
      - name: epsilon
      - name: distance-measure
        default: "clipped_log_likelihood"
      - name: backend-specs
      - name: optimizer-specs
      - name: command
        value: bash main_script.sh
      artifacts:
      - name: initial-parameters
        path: /app/initial-parameters.json
      - name: target-distribution
        path: /app/target-distribution.json
      - name: main-script
        path: /app/main_script.sh
        raw:
          data: |
            qvm -S &
            quilc -S &
            source /app/usr/local/bin/compilers_and_libraries.sh
            python3 python_script.py
      - name: python-script
        path: /app/python_script.py
        raw:
          data: |
            from zquantum.qcbm.optimization import optimize_variational_qcbm_circuit
            from zquantum.core.circuit import load_circuit_template_params, save_circuit_template_params
            from zquantum.core.utils import create_object
            from zquantum.optimizers.utils import save_optimization_results
            from zquantum.core.bitstring_distribution import load_bitstring_distribution

            n_qubits = {{inputs.parameters.n-qubits}}
            single_qubit_gate = "{{inputs.parameters.single-qubit-gate}}"
            static_entangler = "{{inputs.parameters.static-entangler}}"
            topology = "{{inputs.parameters.topology}}"
            epsilon = {{inputs.parameters.epsilon}}
            distance_measure = "{{inputs.parameters.distance-measure}}"

            backend_specs = {{inputs.parameters.backend-specs}}
            backend = create_object(backend_specs)

            optimizer_specs = {{inputs.parameters.optimizer-specs}}
            optimizer = create_object(optimizer_specs)

            initial_params = load_circuit_template_params("initial-parameters.json")
            target_distribution = load_bitstring_distribution("target-distribution.json")

            opt_results = optimize_variational_qcbm_circuit(n_qubits,
                single_qubit_gate, static_entangler, topology, epsilon, initial_params,
                distance_measure, backend, optimizer,
                target_distribution)

            save_optimization_results(opt_results, "optimization-results.json")
            save_circuit_template_params(opt_results.opt_params, "optimized-parameters.json")
    outputs:
      artifacts:
      - name: optimization-results
        path: /app/optimization-results.json
      - name: optimized-parameters
        path: /app/optimized-parameters.json
```
**5. Commit and push your resource**

Commit your changes and push them to GitHub.
(Note that you will not need to do this if you are using the GitHub UI to modify the repository.)
The structure of your repository should look like this:
```
.
├── src
│   ├── python/zquantum/qcbm
│   │   ├── ansatz.py
│   │   └── optimization.py
│   └── setup.py
└── templates
    └── qcbm-optimization.yaml
```

**6. Building a Workflow**

Create a file `optimize-qcbm-circuit.yaml` file with the code below, inserting the URL of your github repository in line 13. This file can go anywhere (except the `templates` folder), and in the repo you'll find it under `examples`.

Notice that at the end of this file, we are inputting the Bars and Stripes dataset.

```YAML
ZapOSApiVersion: v1alpha1
kind: Workflow

resources:
- name: z-quantum-core
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: qcbm
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"
- name: z-quantum-optimizers
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-optimizers.git"
    branch: "master"
- name: qe-forest
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-forest.git"
    branch: "master"
- name: qe-qhipster
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-qhipster.git"
    branch: "master"
- name: qe-openfermion
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-openfermion.git"
    branch: "master"

# Specify the prefix to use when generating names of workflow executions.
metadata:
  generateName: qcbm-opt-

# The actual workflow specification
spec:

  entrypoint: main
  arguments:
    parameters:
    - s3-bucket: quantum-engine
    - s3-key: tutorial-2-qcbm
    - docker-image: 'z-quantum-default'

  templates:

  - name: main
    steps:
    - - name: get-initial-parameters
        template: generate-random-qcbm-params
        arguments:
          parameters:
          - n-qubits: "4"
          - seed: "1234"
          - n-layers: "3"
          - min-val: "-1.57"
          - max-val: "1.57"
          - resources: [z-quantum-core, qcbm]
          - docker-image: "{{workflow.parameters.docker-image}}"
    - - name: optimize-circuit
        template: optimize-variational-qcbm-circuit
        arguments:
          parameters:
          - n-qubits: "4"
          - single-qubit-gate: "Rx"
          - static-entangler: "XX"
          - epsilon: "0.000001"
          - backend-specs: "{'module_name': 'qeforest.simulator', 'function_name': 'ForestSimulator', 'device_name': 'wavefunction-simulator'}"
          - optimizer-specs: "{'module_name': 'zquantum.optimizers.cma_es_optimizer', 'function_name': 'CMAESOptimizer', 'options': {'popsize': 5, 'sigma_0': 0.1, 'tolx': 1e-6}}"
          # - optimizer-specs: "{'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B'}"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-forest, qcbm]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - memory: 2048Mi
          artifacts:
          - initial-parameters:
              from: "{{steps.get-initial-parameters.outputs.artifacts.parameters}}"
          - target-distribution:
              raw:
                data: |
                  {"bitstring_distribution": {"0000": 1.0,
                                              "0001": 0.0,
                                              "0010": 0.0,
                                              "0011": 1.0,
                                              "0100": 0.0,
                                              "0101": 1.0,
                                              "0110": 0.0,
                                              "0111": 0.0,
                                              "1000": 0.0,
                                              "1001": 0.0,
                                              "1010": 1.0,
                                              "1011": 0.0,
                                              "1100": 1.0,
                                              "1101": 0.0,
                                              "1110": 0.0,
                                              "1111": 1.0},
                    "schema": "io-ZapOS-v1alpha1-bitstring-distribution"}
```

**7. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](https://www.orquestra.io/docs/qe/cli/install/)

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `optimize-qcbm-circuit.yaml` by running `qe submit workflow <path/to/workflow/optimize-qcbm-circuit.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: qcbm-opt-58d9k
```

**8. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                qcbm-opt-58d9k
Namespace:           default
ServiceAccount:      default
Status:              Succeeded
Created:             Tue Apr 07 17:35:31 +0000 (2 minutes ago)
Started:             Tue Apr 07 17:35:31 +0000 (2 minutes ago)
Finished:            Tue Apr 07 17:37:45 +0000 (41 seconds ago)
Duration:            2 minutes 14 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            tutorials/z-quantum-qcbm/qcbm-opt/

STEP                           TEMPLATE                           STEPNAME                    DURATION  MESSAGE
 ✔ qcbm-opt-58d9k              main                                                                    
 ├---✔ get-initial-parameters  generate-random-qcbm-params        qcbm-opt-58d9k-3616022042  6m        
 └---✔ optimize-circuit        optimize-variational-qcbm-circuit  qcbm-opt-58d9k-688593504   3m
 ```

This output shows the status of the execution of the steps in your workflow.

**9. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        qcbm-opt-58d9k
Location:    http://40.89.251.200:9000/workflow-results/3dcdd240-f5c6-5c78-a80a-9aa86a6941b5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200407%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200407T191718Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%223dcdd240-f5c6-5c78-a80a-9aa86a6941b5.json%22&X-Amz-Signature=d1107e50f741c002c7fe0d328bafec5ef52afb3819a93c02ef1f19b4f56d59a4
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___

**10. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file

This file will look like the following:

```JSON
"qcbm-opt-58d9k-3616022042":
  {"class":"generate-random-qcbm-params",
  "id":"qcbm-opt-58d9k-3616022042",
  "inputParam:command":"python3 main_script.py","inputParam:cpu":"1000m",
  "inputParam:disk":"10Gi",
  "inputParam:docker-image":"open_pack_default",
  "inputParam:docker-registry":"zapatacomputing",
  "inputParam:docker-tag":"latest",
  "inputParam:max-val":"1.57",
  "inputParam:memory":"1024Mi",
  "inputParam:min-val":"-1.57",
  "inputParam:n-layers":"3",
  "inputParam:n-par":"0",
  "inputParam:n-qubits":"4",
  "inputParam:seed":"1234",
  "inputParam:topology":"all",
  "parameters":
    {"id":"qcbm-opt-58d9k-3616022042/parameters",
    "parameters":
      {"real":[-0.9686289258102783,0.3834215410650721,-0.19553489951766045,0.8960259528612353,0.8791240374930431,-0.7140592194125054,-0.7019022388506764,0.9478786374599604,1.4385575705668343,1.1804284730901775,-0.44645377233229877,0.003124694143660234,0.5760736164405078,0.6678843647263066,-0.40741262995815997,0.19215602424606226,0.00968113906652257,-1.5267670682852579,0.8566755918628546,1.201493338597406,-0.42425801054969114,0.3623440002811702,-1.3333029012410538,-0.4118926211538001,1.3600599202251178,0.47532736973145284]},
    "schema":"zapata-v1-circuit_template_params",
    "taskClass":"generate-random-qcbm-params",
    "taskId":"qcbm-opt-58d9k-3616022042",
    "workflowId":"qcbm-opt-58d9k"},
  "workflowId":"qcbm-opt-58d9k"},
```

The sections `qcbm-opt-58d9k-3616022042` and `qcbm-opt-58d9k-688593504` (which we don't show for brevity) correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the template that was executed for the given step, any input parameters or input artifacts, and the output artifacts. The artifact `parameters` is the output of the `generate-random-qcbm-params` template, and it stores the randomly generated parameters for the circuit. The artifact `optimized-parameters` is the output of the `optimize-variational-qcbm-circuit` template and it contains the trained parameters. More information on the contents of this file are found on the [Workflow Results via JSON page](https://www.orquestra.io/docs/dcs/data/json/).

___


## Plotting the results

In order to plot the training process, we use the file `plot_qcbm_opt_history.py`. In the repo, you can find it in the folder named `examples`. This plots the results from the existing `qcbm_example.json` file, but if you'd like to plot the results of your own training, please change the name to your json file in line 22. 

```python
import json
import matplotlib
# matplotlib.use("Agg")

from matplotlib import pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.animation as animation
from matplotlib.cbook import get_sample_data
import matplotlib.gridspec as gridspec

import numpy as np

def get_ordered_list_of_bitstrings(num_qubits):
    bitstrings = []
    for i in range(2**num_qubits):
        bitstring = "{0:b}".format(i)
        while len(bitstring) < num_qubits:
            bitstring = "0" + bitstring
        bitstrings.append(bitstring)
    return bitstrings

# Insert the path to your JSON file here
with open('./examples/qcbm-example.json') as f:
    data = json.load(f)

# Extract lists of energies, bond lengths, and basis sets.
distances = []
minimum_distances = []
bistring_distributions = []

current_minimum = 100000
for step_id in data:
    step = data[step_id]
    if step["class"] == "optimize-variational-qcbm-circuit":
        ordered_bitstrings = get_ordered_list_of_bitstrings(int(step["inputParam:n-qubits"]))
        
        for evaluation in step["optimization-results"]["history"]:
            distances.append(evaluation["value"])
            current_minimum = min(current_minimum, evaluation["value"])
            minimum_distances.append(current_minimum)

            bitstring_dist = []
            for key in ordered_bitstrings:
                try:
                    bitstring_dist.append(evaluation["bitstring_distribution"][key])
                except:
                    bitstring_dist.append(0)
            bistring_distributions.append(bitstring_dist)

fig = plt.figure(figsize=(16,8))
gs = gridspec.GridSpec(nrows=8, ncols=3, width_ratios=[16,1,1])
ax1 = fig.add_subplot(gs[:4,0])
ax2 = fig.add_subplot(gs[5:,0])
axs = [fig.add_subplot(gs[i,1]) for i in range(8)] + [fig.add_subplot(gs[i,2]) for i in range(8)]

evals = []
plotted_distances = []
plotted_min_distances = []
line_widths = []

images = [np.array([0,0,0,0]),
          np.array([0,0,0,1]),
          np.array([0,0,1,0]),
          np.array([0,0,1,1]),
          np.array([0,1,0,0]),
          np.array([0,1,0,1]),
          np.array([0,1,1,0]),
          np.array([0,1,1,1]),
          np.array([1,0,0,0]),
          np.array([1,0,0,1]),
          np.array([1,0,1,0]),
          np.array([1,0,1,1]),
          np.array([1,1,0,0]),
          np.array([1,1,0,1]),
          np.array([1,1,1,0]),
          np.array([1,1,1,1])]

def animate(i):
    evals.append(i)
    plotted_distances.append(distances[i])
    plotted_min_distances.append(minimum_distances[i])
    line_widths.append(1)
    ax1.clear()
    ax1.set(xlabel='Evaluation Index', ylabel='Clipped negative log-likelihood cost function')
    ax1.set_ylim([1.5, 3.5])
    ax1.scatter(evals, plotted_distances, color="green", linewidths=line_widths, marker=".")
    ax1.plot(evals, plotted_min_distances, color="purple", linewidth=2)

    ax2.clear()
    ax2.set(xlabel='Bitstring', ylabel='Measured Probability')
    ax2.set_ylim([0, .25])
    ax2.bar(ordered_bitstrings, bistring_distributions[i], facecolor='green')

    if distances[i] == minimum_distances[i]:
        normalized_distribution = np.array(bistring_distributions[i])/max(bistring_distributions[i])
        for j in range(len(ordered_bitstrings)):
            axs[j].clear()
            axs[j].set_xticks(np.arange(-.5, 2, 1), minor=True)
            axs[j].set_yticks(np.arange(-.5, 2, 1), minor=True)
            axs[j].tick_params(axis='x', colors=(0,0,0,0))
            axs[j].tick_params(axis='y', colors=(0,0,0,0))

            axs[j].grid(which='minor', color='k', linestyle='-', linewidth=2)
            fading_factor = normalized_distribution[j]
            axs[j].imshow((images[j].reshape((2,2))), alpha=fading_factor, vmin=0, vmax=1, cmap='PiYG')

    return tuple([ax1, ax2] + axs)

anim = FuncAnimation(fig, animate, frames=700, interval=1)

# # Set up formatting for the movie files
# Writer = animation.writers['ffmpeg']
# writer = Writer(fps=10, metadata=dict(artist='Me'), bitrate=1800)
# anim.save('qcbm_opt_700_iterations.mp4', writer=writer)

plt.show()
```

This code will plot an animation of the probabilities for each of the 16 images, and the cost function above. Notice that the cost decreases during the training process, and the probabilities for the bars and stripes images become close to *1/6*, as desired.

![](../img/results.png)
*The results.*
---
title: "Solve Max Cut With QAOA"
date: 2020-07-10T14:25:20-04:00
draft: false
summary: Find the maximum cut whose size is at least the size of any other cut using the Quantum Approximate Optimization Algorithm
weight: 5
---

This tutorial will walk through using Quantum Engine to use Quantum Approximate Optimization Algorithm to solve MaxCut problem and use different optimizers to solve it.

In addition to that we'll cover some advanced workflow features (e.g. recursive tasks) and using Orquestra interfaces.

## Quantum Approximate Optimization Algorithm
Quantum Approximate Optimization Algorithm (QAOA) is a variational quantum algorithm which allows to solve combinatorial optimization problems. We'll make a very high-level overview of only those parts of QAOA that we need for this tutorial. If you're interested in a more detailed description of QAOA you can read either [the original paper](https://arxiv.org/abs/1411.4028) or [this article](https://www.mustythoughts.com/Quantum-Approximate-Optimization-Algorithm-Explained.html).


In order to solve such problem we need to go through the following steps:

1. Translate our problem into an Ising Hamiltonian
2. Prepare QAOA ansatz
3. Optimize the parameters for the ansatz.

Here we'll focus only on the last step – optimization.

QAOA ansatz consists of several layers, sometimes called "steps", each layer parametrized by two parameters: &beta; and &gamma;, which we also call angles. The goal of the optimization step is to find such values of the angles which minimize the cost function.
In our case the problem at hand is MaxCut problem – we try to divide a graph into two groups in such way, that the sum of the weights of the edges going between the groups is as big as possible.

In this tutorial we will see how to solve this problem using layer-by-layer optimization and how we can use Orquestra to compare different optimizers.

## Running QAOA – layer by layer optimization

**1. Building workflow**

Let's start from the ready-to-go workflow. Just copy the workflow below and save it in `qaoa_lbl_example.yaml` file. In the following sectiosn we will explain what the steps in this workflow mean. You can also find this workflow [here](https://github.com/zapatacomputing/z-quantum-qaoa/blob/master/examples/qaoa_lbl_example.yaml).

```yaml
ZapOSApiVersion: v1alpha1
kind: Workflow

resources:
- name: z-quantum-core
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: z-quantum-qaoa
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-qaoa.git"
    branch: "master"
- name: z-quantum-optimizers
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-optimizers.git"
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


metadata:
  generateName: qaoa-example-

spec:
  entrypoint: main
  arguments:
    parameters:
    - s3-bucket: quantum-engine
    - s3-key: projects/qaoa/
    - docker-image: z-quantum-default
    - docker-tag: latest

  templates:
  - name: main
    steps:
    - - name: generate-graph
        template: generate-erdos-renyi-graph
        arguments:
          parameters:
            - n-nodes: "5"
            - edge-probability: "0.8"
            - resources: [z-quantum-core]
            - docker-image: "{{workflow.parameters.docker-image}}"
            - docker-tag: "{{workflow.parameters.docker-tag}}"
    - - name: get-maxcut-hamiltonian
        template: get-maxcut-hamiltonian
        arguments:
          parameters:
          - resources: [z-quantum-core, qe-openfermion, z-quantum-qaoa]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - graph:
              from: '{{steps.generate-graph.outputs.artifacts.graph}}'
    - - name: build-circuit-template
        template: build-farhi-qaoa-circuit-template
        arguments:
          parameters:
          - resources: [z-quantum-core, qe-openfermion, z-quantum-qaoa]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - hamiltonian:
              from: '{{steps.get-maxcut-hamiltonian.outputs.artifacts.hamiltonian}}'
    - - name: generate-random-ansatz-params
        template: generate-random-ansatz-params
        arguments:
          parameters:
          - min-val: "-0.01"
          - max-val: "0.01"
          - n-layers: "0"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'

    - - name: build-uniform-parameter-grid
        template: build-uniform-parameter-grid
        arguments:
          parameters:
          - n-layers: "1"
          - min-value: "0"
          - max-value: "3.14159265359"
          - step: "0.314159265359"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'

    - - name: optimize-lbl
        template: optimize-lbl
        arguments:
          parameters:
          - n-layers: "2"
          artifacts:
          - params:
              from: '{{steps.generate-random-ansatz-params.outputs.artifacts.params}}'
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'
          - hamiltonian:
              from:  '{{steps.get-maxcut-hamiltonian.outputs.artifacts.hamiltonian}}'
          - parameter-grid:
              from: '{{steps.build-uniform-parameter-grid.outputs.artifacts.parameter-grid}}'

  # Optimize a variational circuit layer-by-layer
  - name: optimize-lbl
    inputs:
      parameters:
      - name: n-layers
      artifacts:
      - name: params
      - name: ansatz
      - name: hamiltonian
      - name: parameter-grid

    steps:
    - - name: generate-random-ansatz-params
        template: generate-random-ansatz-params
        arguments:
          parameters:
          - min-val: "-0.01"
          - max-val: "0.01"
          - n-layers: "{{inputs.parameters.n-layers}}"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: '{{inputs.artifacts.ansatz}}'

    # Append the parameters for the active layer to parameters for previous layers
    - - name: combine-ansatz-params
        template: combine-ansatz-params
        arguments:
          parameters:
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - params1:
              from: '{{inputs.artifacts.params}}'
          - params2:
              from: '{{steps.generate-random-ansatz-params.outputs.artifacts.params}}'

    # Optimize the active layer and all preceding layers using black-box optimization
    - - name: optimize-variational-circuit
        template: optimize-variational-circuit
        arguments:
          parameters:
          - backend-specs: "{'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}"
          - optimizer-specs: "{'module_name': 'zquantum.optimizers.grid_search', 'function_name': 'GridSearchOptimizer'}"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-qhipster, z-quantum-qaoa]
          - docker-image: qe-qhipster
          - docker-tag: latest
          artifacts:
          - ansatz:
              from: '{{inputs.artifacts.ansatz}}'
          - initial-parameters:
              from: '{{steps.combine-ansatz-params.outputs.artifacts.combined-params}}'
          - qubit-operator:
              from: '{{inputs.artifacts.hamiltonian}}'
          - parameter-grid:
              from: '{{inputs.artifacts.parameter-grid}}'

    # Decrement the number of layers to be added
    - - name: decrement-n-layers
        template: evaluate-python-expression
        arguments:
          parameters:
          - expression: '{{inputs.parameters.n-layers}} - 1'
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"

    # Check if we have added the number of layers requested
    - - name: check-if-done
        template: evaluate-python-expression
        arguments:
          parameters:
          - expression: '{{steps.decrement-n-layers.outputs.parameters.result}} == 0'
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"

    # Recursively call another optimization if there are more layers to add
    - - name: optimize-lbl
        template: optimize-lbl
        arguments:
          parameters:
            - n-layers: '{{steps.decrement-n-layers.outputs.parameters.result}}'
          artifacts:
          - params:
              from: '{{steps.optimize-variational-circuit.outputs.artifacts.optimized-parameters}}'
          - ansatz:
              from: '{{inputs.artifacts.ansatz}}'
          - hamiltonian:
              from: '{{inputs.artifacts.hamiltonian}}'
          - parameter-grid:
              from: '{{inputs.artifacts.parameter-grid}}'
        when: '{{steps.check-if-done.outputs.parameters.result}} == False'

```

**2. Running workflow**

Submit your `qaoa_lbl_example.yaml` by running `qe submit workflow <path/to/workflow/qaoa_lbl_example.yaml>`**

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: qaoa-example-rk5wj
```

**3. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
STEP                                                PODNAME                        DURATION  MESSAGE
 ● qaoa-example-9pb9p (main)
 └---● generate-graph (generate-erdos-renyi-graph)  qaoa-example-9pb9p-3503511843  18s
Name:                qaoa-example-9pb9p
Namespace:           default
ServiceAccount:      default
Status:              Running
Created:             Thu Mar 19 21:14:33 +0000 (19 seconds ago)
Started:             Thu Mar 19 21:14:33 +0000 (19 seconds ago)
Duration:            19 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            projects/qaoa/
  docker-image:      z-quantum-default
  docker-tag:        latest

STEP                                                PODNAME                        DURATION  MESSAGE
 ● qaoa-example-9pb9p (main)
 └---● generate-graph (generate-erdos-renyi-graph)  qaoa-example-9pb9p-3503511843  19s
 ```

This output shows the status of the execution of the steps in your workflow.

**4. Workflow explanation: problem definition**

This workflow might take a couple of minutes to finish, so in the meantime let's see what the tasks in the workflow do:

- `generate-graph` - generates a random graph for which we will be solving MaxCut problem.
- `get-maxcut-hamiltonian` - creates a Hamiltonian describing our problem for given graph.
- `build-circuit-template` - prepares a template for the circuit (ansatz) – later we will fill it in with the parameters.
- `generate-random-ansatz-params` - creates some starting parameters for the ansatz.
- `build-uniform-parameter-grid` - creates an object representing a parameter grid for the grid search optimization.

All of these are just initial steps we need to define our problem and build the circuit. Now that we have this set up, we can take a look into how we do optimization.


**5. Workflow explanation: optimization**

In this workflow we present a specific way to perform optimization – layer by layer optimization using grid search. "Layer by layer" means that we are optimizing only one layer at a time. First we deal with the angles for the first layer, once they're fixed we optimize the angles for the second layer and then the following.

In order to optimize the angles we use method called "grid search" – it is a very simple method, where we prepare a grid of parameters and just check what is the result for every pair of &beta; and &gamma;.

All of this happens in the `optimize-lbl` task. Contrary to all the other tasks we used here, this one is defined inside the same file as workflow and consists of the following steps:

- `generate-random-ansatz-params` - creates random initial parameters for the new layer.
- `combine-ansatz-params` - creates one "params" object by combining parameters from previous layers with the newly created ones.
- `optimize-variational-circuit` - finds optimal parameters for the circuit.
- `decrement-n-layers` – decrements the layer counter.
- `check-if-done` – checks if layer counter is equal to zero.
- `optimize-lbl` - launches the whole task again depending on the output of the previous step.



**6. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        qaoa-example-9pb9p
Location:    http://40.89.254.33:9000/workflow-results/472dcb88-af75-5207-aa5c-06ad817d664d.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200518%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200518T213406Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22472dcb88-af75-5207-aa5c-06ad817d664d.json%22&X-Amz-Signature=f38778040e305ed71d98f7043342f08a13c4e1f845038d90bf8f72e561f2cf68
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___


## Running QAOA comparing optimizers

Let's be honest – there are some more sophisticated optimizers than grid search. It only checks the values for the predefined grid and the chance that it will actually find the minimum depends on how dense the grid is. Therefore it might be a good idea to modify it and try some other optimizers.

To make things simpler to visualize this time we will try to solve the problem for a one-layer case. To do that we will replace `optimize-lbl` task with `optimize-variational-circuit` – the same we used inside `optimize-lbl`.


**Interfaces**

One of the features that make Orquestra a really flexible tool are Interfaces. The main idea behind it is to be able to switch between different methods at the level of the workflow, without need to modify any code. You can read about it in more details in the [Interfaces section](https://www.orquestra.io/docs/quantum-resources/interfaces/), here we'll focus on the example of Optimizer Interface.

As you can see in the workflow, `optimize-variational-circuit` task has a field called `optimizer-specs`. It is a dictionary which specifies what type of optimizer do we want to use. It has two required keys:

- `module_name`: specifies from what python module do we want to import the optimizer
- `function_name`: specifies which function do we want to use to create it

So in the workflow above you can see that we create our optimizer based on `GridSearchOptimizer` class which is imported from `zquantum.optimizers.grid_search`. For this particular optimizer we also need to provide an input artifact `parameter-grid`.

Why is using Optimizer Interface convenient? Because all the classes conforming to this interface have `minimize` function, which takes an array as input and returns `OptimizeResults` object. Therefore by just changing `optimizer-specs` field in your workflow you can try out many different optimizers.

**1. Change to 1-layer workflow**

To make things simpler to analyze we will analyze a one-layer case. To do that we will replace `optimize-lbl` task with `optimize-variational-circuit` – the same we used inside `optimize-lbl`.

To do that you need to:
1. Copy `qaoa_lbl_example.yaml` file and rename it to `qaoa_multiple_optimizers.yaml`
2. Copy `optimize-variational-circuit` and paste it after `build-uniform-parameter-grid`.
3. Modify its input artifacts to reflect data dependencies (should be the same paths as inputs of `optimize-lbl`)
4. Remove `optimize-lbl` task (and its definition)
5. Change parameters in `generate-random-ansatz-params` to `min-val: "1"`, `max-val: "2"`, `n-layers: "1"`
6. Change parameters in `build-uniform-parameter-grid` to `max-value: "3.14159265359+0.05"` and `step: "0.1047197551"`.

Here's how it should look like:

```yaml
ZapOSApiVersion: v1alpha1
kind: Workflow

resources:
- name: z-quantum-core
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: z-quantum-qaoa
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-qaoa.git"
    branch: "master"
- name: z-quantum-optimizers
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-optimizers.git"
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

metadata:
  generateName: qaoa-example-

spec:
  entrypoint: main
  arguments:
    parameters:
    - s3-bucket: quantum-engine
    - s3-key: projects/qaoa/
    - docker-image: z-quantum-default
    - docker-tag: latest

  templates:
  - name: main
    steps:
    - - name: generate-graph
        template: generate-erdos-renyi-graph
        arguments:
          parameters:
            - n-nodes: "5"
            - edge-probability: "0.8"
            - resources: [z-quantum-core]
            - docker-image: "{{workflow.parameters.docker-image}}"
            - docker-tag: "{{workflow.parameters.docker-tag}}"
    - - name: get-maxcut-hamiltonian
        template: get-maxcut-hamiltonian
        arguments:
          parameters:
          - resources: [z-quantum-core, qe-openfermion, z-quantum-qaoa]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - graph:
              from: '{{steps.generate-graph.outputs.artifacts.graph}}'
    - - name: build-circuit-template
        template: build-farhi-qaoa-circuit-template
        arguments:
          parameters:
          - resources: [z-quantum-core, qe-openfermion, z-quantum-qaoa]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - hamiltonian:
              from: '{{steps.get-maxcut-hamiltonian.outputs.artifacts.hamiltonian}}'
    - - name: generate-random-ansatz-params
        template: generate-random-ansatz-params
        arguments:
          parameters:
          - min-val: "1"
          - max-val: "2"
          - n-layers: "1"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'

      - name: build-uniform-parameter-grid
        template: build-uniform-parameter-grid
        arguments:
          parameters:
          - n-layers: "1"
          - min-value: "0"
          - max-value: "3.14159265359+0.05"
          - step: "0.1047197551"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'
    - - name: optimize-variational-circuit
        template: optimize-variational-circuit
        arguments:
          parameters:
          - backend-specs: "{'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}"
          - optimizer-specs: "{'module_name': 'zquantum.optimizers.grid_search', 'function_name': 'GridSearchOptimizer', 'options': {'keep_value_history': True}}"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-qhipster, z-quantum-qaoa]
          - docker-image: qe-qhipster
          - docker-tag: latest
          artifacts:
          - ansatz:
              from: '{{steps.build-circuit-template.outputs.artifacts.ansatz}}'
          - initial-parameters:
              from: '{{steps.generate-random-ansatz-params.outputs.artifacts.params}}'
          - qubit-operator:
              from: '{{steps.get-maxcut-hamiltonian.outputs.artifacts.hamiltonian}}'
          - parameter-grid:
              from: '{{steps.build-uniform-parameter-grid.outputs.artifacts.parameter-grid}}'
```

**2. Running different optimizers in parallel**

In order to compare different optimizers you should do the following steps:

1. Copy the `optimize-variational-circuit` step
2. Change the `name` field for the copy – you cannot have several steps with the same name. For example, you can append the name of the optimizer to the `name`, e.g.: `optimize-variational-circuit-grid-search`
3. Change the `optimizer-specs` to use another optimizer. Below are some of the optimizers you can try. In order for the visualization in the next steps to work, you also need to pass additional dictionary with options: `'options': {'keep_value_history': True}`. Optimizer running with this setting will keep track of the whole optimization history.
4. You can make steps run in parallel by replacing the first dash before the `name` field of given step to space. See how it's done for `build-uniform-parameter-grid`, to be running in parallel with `generate-random-ansatz-params`.

```yaml
- optimizer-specs: "{'module_name': 'zquantum.optimizers.grid_search', 'function_name': 'GridSearchOptimizer', 'options': {'keep_value_history': True}}"
- optimizer-specs: "{'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B', 'options': {'keep_value_history': True}}"
- optimizer-specs: "{'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'Nelder-Mead', 'options': {'keep_value_history': True}}"
- optimizer-specs: "{'module_name': 'zquantum.optimizers.cma_es_optimizer', 'function_name': 'CMAESOptimizer', 'options': {'popsize': 5, 'sigma_0': 0.1, 'tolx': 1e-3, 'keep_value_history': True}}"
```

You can find a workflow running these optimizers in parallel in [z-quantum-qaoa repository](https://github.com/zapatacomputing/z-quantum-qaoa/blob/master/examples/qaoa_multiple_optimizers.yaml).

**3. Running the Workflow**

Now run the workflow the same way you did for the layer-by-layer case: `qe submit workflow <path/to/workflow/vqe-workflow.yaml>`.

To monitor the progress run `qe get workflow <workflow-ID>` and once it's ready get the results using `qe get workflowresult <workflow-ID>`.

**4. Analyze the results**

* Copy the python script below into the same directory as the JSON file.
* In the python script, replace the name of the JSON file with the name of the JSON file that you have downloaded.
* Run the python script to plot the optimization trajectories. 


```python
"""Plot the optimization curves for QAOA from a Quantum Engine workflow result JSON."""

import json
import numpy as np
from matplotlib import pyplot as plt
import matplotlib.ticker as tck

def process_data_for_colormesh(x):
    x_diff = x[1] - x[0]
    x = np.append(x, x[-1] + x_diff)
    x = x - x_diff/2
    return x

def plot_grid_values(ax, grid_results):
    grid_size = int(np.sqrt(len(grid_results)))
    x = process_data_for_colormesh(grid_results[:,0][::grid_size])
    y = process_data_for_colormesh(grid_results[:,1][:grid_size])
    XX, YY = np.meshgrid(x, y)
    grid_values = grid_results[:,2].reshape(len(x)-1, len(y)-1).T

    ## This is for having ticks in the plot as multiples of pi
    ax.xaxis.set_major_formatter(tck.FuncFormatter(
    lambda val,pos: '{:.2f}$\pi$'.format(val/np.pi) if val !=0 else '0'
    ))
    ax.xaxis.set_major_locator(tck.MultipleLocator(base=np.pi/4))

    ax.yaxis.set_major_formatter(tck.FuncFormatter(
    lambda val,pos: '{:.2f}$\pi$'.format(val/np.pi) if val !=0 else '0'
    ))
    ax.yaxis.set_major_locator(tck.MultipleLocator(base=np.pi/4))
    mesh_plot = ax.pcolormesh(XX, YY, grid_values)
    return mesh_plot, ax

def plot_trajectory(ax, optimizer_results, color, label):
    ax.plot(optimizer_results[0, 0], optimizer_results[0, 1], '*', color=color)
    ax.plot(optimizer_results[:, 0], optimizer_results[:, 1], color=color, label=label)
    return ax

def plot_cost_function(ax, optimizer_results, color, label):
    ax.plot(optimizer_results[:,2], color=color, label=label)
    return ax

# Insert the path to your JSON file here
with open('38d3d467-cdbe-5ab4-86d5-1123bb89dfa1.json') as f:
    data = json.load(f)

# Extract parameters and values
bfgs_results = []
cma_es_results = []
nelder_mead_results = []
grid_results = []
initial_params = []

for task in data:
    if data[task]['class'] == 'generate-random-ansatz-params':
        initial_params = data[task]['params']['parameters']['real']

for task in data:
    if data[task]['class'] == 'optimize-variational-circuit':
        results = [[initial_params[0], initial_params[1], np.nan]]
        history = data[task]['optimization-results']['history']
        for epoch in history:
            x = epoch['params']['real'][0]
            y = epoch['params']['real'][1]
            value = epoch['value']
            results.append([x, y, value])

        specs = data[task]['inputParam:optimizer-specs']
        if "L-BFGS-B" in specs:
            bfgs_results = np.array(results)
        if "Nelder-Mead" in specs:
            nelder_mead_results = np.array(results)
        if "CMAESOptimizer" in specs:
            cma_es_results = np.array(results)
        if "GridSearchOptimizer" in specs:
            grid_results = np.array(results)[1:,:]

# Plot trajectories
fig, (ax1, ax2) = plt.subplots(1, 2)
mesh_plot, ax1 = plot_grid_values(ax1, grid_results)
ax1 = plot_trajectory(ax1, cma_es_results, color='g', label="CMA-ES")
ax1 = plot_trajectory(ax1, bfgs_results, color='b', label="L-BFGS-B")
ax1 = plot_trajectory(ax1, nelder_mead_results, color='r', label="Nelder-Mead")

cbar = fig.colorbar(mesh_plot, ax=ax1)
ax1.legend()
ax1.set_xlabel("beta")
ax1.set_ylabel("gamma")

# Plot values history
ax2 = plot_cost_function(ax2, cma_es_results, color='g', label="CMA-ES")
ax2 = plot_cost_function(ax2, bfgs_results, color='b', label="L-BFGS-B")
ax2 = plot_cost_function(ax2, nelder_mead_results, color='r', label="Nelder-Mead")

ax2.set_xlabel("Iterations")
ax2.set_ylabel("Value")
plt.tight_layout()
plt.show()
```
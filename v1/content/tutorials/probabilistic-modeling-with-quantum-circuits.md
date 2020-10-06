---
title: "Probabilistic Modeling with Quantum Circuits"
summary: Find a quantum distribution which generates the Bars and Stripes dataset with a Quantum Circuit Born Machine.
weight: 8
---
This tutorial will walk through an implementation of a quantum circuit Born machine (QCBM) using Orquestra to find a distribution that generates the Bars and Stripes (BAS) dataset that fit in a 2 × 2 pixel image.

## The quantum circuit Born machine
A quantum circuit Born machine (QCBM) is an unsupervised generative model which represents the probability distribution of a dataset as a quantum state. [A quantum circuit Born machine (QCBM)](https://www.nature.com/articles/s41534-019-0157-8) model was proposed as an approach to load arbitrary probability distributions in noisy intermediate-scale quantum (NISQ) devices.

In simple terms, given a dataset, the QCBM is used to obtain a good approximation to the target distribution defined by that dataset. That is, a distribution such that when we sample randomly from it, it is very likely to return the elements in the set or similar elements, and unlikely to return anything different.

The way a QCBM builds a distribution is by starting with a vector of parameters (or angles for our gates), and preparing a wave function using a quantum circuit model. The process of training the QCBM model gives us a new vector of parameters that generates a good approximation to the aforementioned distribution.

The probability of an outcome **x** is given by Born's rule

![](../../img/tutorials/born-rule.png)

## The dataset: Bars and Stripes
In this tutorial we use a QCBM to find a distribution that generates a particular dataset. This dataset is the Bars and Stripes (BAS) dataset. The BAS dataset is widely used to study generative models for unsupervised machine learning. It is comprised by the black and white images inside an *m* × *n* rectangle which contain any number of either horizontal stripes or vertical bars. The 6-element set corresponding to *m* = 2 and *n* = 2 is illustrated below.

![The Bars and Stripes Dataset](../../img/tutorials/bars-and-stripes.png)*The Bars and Stripes (BAS) dataset inside a 2 × 2 pixel image.*

The way we parametrize the elements of the BAS dataset is with four qubits, one corresponding to each of the pixels in the images (taken from top to bottom, and each row from left to right). More specifically, for the 2 × 2 example above, the BAS patterns are represented by the bitstrings 0000, 1100, 0101, 1111, 0011, and 1010. For simplicity, we can choose to map them to their corresponding computational basis states.

## The cost function: Clipped negative log-likelihood
To train the model, we need a cost function which tells us if the distribution we are obtaining is similar to the target distribution or not.

As it is very common in machine learning, we'll train the model by minimizing the Kullback-Leibler (KL) divergence, which measures the distance between two distributions. This is equivalent to minimizing the negative log-likelihood

![](../../img/tutorials/cost-function.png)

where the summation index *d* runs over the number of BAS patters in the training data set, and *D* is the size of the dataset.

Since the formula contains the logarithm of the probability, we want to avoid cases in which the probability is zero. For this reason, we replace the very small values of the probability by some fixed small value, and get the following variant:

![](../../img/tutorials/modified-cost-function.png)

## The training process

The training process of the QCBM is referred to as the data-driven quantum circuit learning (DDQCL) algorithm. It consists of the following steps:
1. Initialize the circuit with random parameters.
2. Prepare the initial state, execute the quantum circuit to obtain the QCBM model and perform measurements in the computational basis.
3. Compare the distribution obtained to that one of the dataset.
4. Update the parameters using an optimizer.

Steps 2-4 get repeated until we achieve a small enough error. Notice that Steps 1 and 2 are quantum steps, while 3 and 4 are classical.

![](../../img/tutorials/quantum-classical.png)
*The training process.*

## The ansatz

The circuit for the QCBM in this tutorial has a combination of single qubit and entangling gates. In the image below, at the left of the circuit, we show the graph of pairs of qubits which are connected with *XX* (a.k.a. Mølmer-Sørensen) gates. We call this graph the *topology* of the circuit. Note that in order to explore the full space, we need this graph to be connected. In this workshop, we chose the all-to-all topology, which connects each pair of vertices.

![](../../img/tutorials/ansatz-all.png)
*A circuit with the all-to-all topology.*

For illustration, in the figure below we see a circuit with a different topology, the star topology, which connects qubit 1 to all the other ones.

![](../../img/tutorials/ansatz-star.png)
*A circuit with the star topology.*

## The results: A Bars and Stripes distribution

As we'll be able to see when we run the workflow, the QCBM model is able to accurately represent the distribution corresponding to the BAS dataset, by attaching a high probability close to *1/6* for each of the BAS patterns, and a low probability (close to 0) for the remaining patterns.

![The DDQCL Process](../../img/tutorials/training.png)*We start with a random distribution coming from the random initialization of the circuit parameters. After the training process, we end with a distribution that gives the BAS patterns high probabilities, and all the other patterns low probabilities.*

## Composing a workflow to generate a QCBM for BAS patterns

In the next steps we will write the code necessary to build the BAS training data and then compose a workflow to train a QCBM model in Orquestra.

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `bars-and-stripes`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help

This repository will be where you build your component. [This GitHub repo](https://github.com/zapatacomputing/tutorial-4-probabilistic-modeling) can be used as a reference for how the `bars-and-stripes` component should look like throughout the tutorial.

**2. Add python code to the repository**

Now we will add a Python file to the repository that contains a function for generating the BAS training data.

Using either the GitHub UI or by cloning your repo and using the command line, create a file `target.py`. 

```python
import itertools
import numpy as np
import math
import random
from typing import List

from zquantum.core.bitstring_distribution import BitstringDistribution

def get_bars_and_stripes_target_distribution(nrows, ncols, fraction=1., method="zigzag"):
    ''' Generates bars and stripes (BAS) data in zigzag pattern
    Args: 
        nrows (int): number of rows in BAS dataset 
        ncols (int): number of columns in BAS dataset 
        fraction (float): maximum fraction of patterns to include (at least one pattern will always be included)
        method (string): the method to use to label the qubits
    Returns: 
        Array of list of BAS pattern. 
    '''
    if method == "zigzag":
        data = bars_and_stripes_zigzag(nrows, ncols)
    else:
        raise RuntimeError("Method: {} is not supported for generated a target distribution for bars and stripes".format(method))

    # Remove patterns until left with a subset that has cardinality less than or equal to the percentage * total number of patterns
    num_desired_patterns = int(len(data) * fraction)
    num_desired_patterns = max(num_desired_patterns, 1)
    data = random.sample(list(data), num_desired_patterns)

    distribution_dict = {}
    for pattern in data: 
        bitstring = ""
        for qubit in pattern:
            bitstring += str(qubit)

        distribution_dict[bitstring] = 1.

    return BitstringDistribution(distribution_dict)


# Generate BAS with specified rows and columns in zigzag pattern (taken from Vicente's code, would be careful about ownership of code)
def bars_and_stripes_zigzag(nrows, ncols):
    ''' Generates bars and stripes data in zigzag pattern
    Args: 
        nrows (int): number of rows in BAS dataset 
        ncols (int): number of columns in BAS dataset
    Returns: 
        Array of list of BAS pattern. 
    '''

    data = [] 
    
    for h in itertools.product([0,1], repeat=ncols):
        pic = np.repeat([h], nrows, 0)
        data.append(pic.ravel().tolist())
          
    for h in itertools.product([0,1], repeat=nrows):
        pic = np.repeat([h], ncols, 1)
        data.append(pic.ravel().tolist())
    
    data = np.unique(np.asarray(data), axis=0)

    return data


def get_num_bars_and_stripes_patterns(nrows, ncols) -> int:
    ''' Get the number of bars and stripes patters for a 2-dimensional grid.
    Args:
        nrows (int): number of rows in BAS dataset 
        ncols (int): number of columns in BAS dataset 
    Returns: 
        (int): number of bars and stripes patterns
    '''
    # Always have all blank and all filled
    num_patterns = 2

    for dimension in [nrows, ncols]: 
        for num_choices in range(1, dimension):
            # nCr = n! / (n-r)! * r!
            num_patterns += math.factorial(dimension) // (math.factorial(dimension-num_choices) * math.factorial(num_choices))

    return num_patterns
```

**4. Commit and push your component**

Commit your changes and push them to GitHub.
(Note that you will not need to do this if you are using the GitHub UI to modify the repository.)

**5. Building a Workflow**

Create a file `optimize-qcbm-circuit.yaml` file with the code below, inserting the URL of your github repository in line 11. This file can go anywhere. A reference workflow can be found in the `examples` directory of the Orquestra [z-quantum-qcbm](https://github.com/zapatacomputing/z-quantum-qcbm) repository.

 _**Note:** According to recent [changes](https://www.zdnet.com/article/github-to-replace-master-with-main-starting-next-month/), GitHub will start using `main` instead of `master` as the default branch. If your workflow doesn't run, try changing the lines below from `branch: "master"` to `branch: "main"`._

```YAML
# Workflow API version
apiVersion: io.orquestra.workflow/1.0.0

# Prefix for workflow ID
name: qcbm-opt

imports:
- name: bars-and-stripes
  type: git
  parameters:
    repository: git@github.com:<your github username>/<your github repository name>
    branch: master
- name: z-quantum-core
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: z-quantum-qcbm
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-qcbm.git"
    branch: "master"
- name: z-quantum-optimizers
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/z-quantum-optimizers.git"
    branch: "master"
- name: qe-qiskit
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/qe-qiskit.git"
    branch: "master"
- name: qe-openfermion
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/qe-openfermion.git"
    branch: "master"

steps:

- name: get-initial-parameters
  config:
    runtime:
      language: python3
      imports: [z-quantum-core, z-quantum-qcbm]
      parameters:
        file: z-quantum-core/steps/circuit.py
        function: generate_random_ansatz_params
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "10Gi"
  inputs:
    - ansatz_specs: '{"module_name": "zquantum.qcbm.ansatz", "function_name": "QCBMAnsatz", "number_of_layers": 4, "number_of_qubits": 4, "topology": "all"}'
      type: string
    - min_value: -1.57
      type: float
    - max_value: 1.57
      type: float
    - seed: 9
      type: int
    - number_of_parameters: "None"
      type: string
  outputs:
    - name: params
      type: ansatz-params
- name: get-bars-and-stripes-distribution
  config:
    runtime:
      language: python3
      imports: [z-quantum-core, bars-and-stripes]
      parameters:
        file: bars-and-stripes/target.py
        function: generate_bars_and_stripes_target_distribution
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "10Gi"
  inputs:
    - nrows: 2
      type: int
    - ncols: 2
      type: int
    - fraction: 1.0
      type: float
    - method: 'zigzag'
      type: string
  outputs:
    - name: distribution
      type: bitstring-distribution

- name: optimize-circuit
  passed: [get-bars-and-stripes-distribution, get-initial-parameters]
  config:
    runtime:
      language: python3
      imports:  [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-qiskit, z-quantum-qcbm]
      parameters:
        file: z-quantum-qcbm/steps/optimize_variational_qcbm_circuit.py
        function: optimize_variational_qcbm_circuit
    resources:
      cpu: "1000m"
      memory: "2Gi"
  inputs:
  - n_qubits: 4
    type: int
  - n_layers: 4
    type: int
  - topology: all
    type: string
  - distance_measure_specs: '{"module_name": "zquantum.core.bitstring_distribution", "function_name": "compute_clipped_negative_log_likelihood"}'
    type: string
  - distance_measure_parameters: '{"epsilon": 1e-6}'
    type: string
  - backend_specs: '{"module_name": "qeqiskit.simulator", "function_name": "QiskitSimulator", "device_name": "statevector_simulator"}'
    type: string
  - optimizer_specs: '{"module_name": "zquantum.optimizers.cma_es_optimizer", "function_name": "CMAESOptimizer", "options": {"popsize": 5, "sigma_0": 0.1, "tolx": 1e-4}}'
    type: string
  - initial_parameters: ((get-initial-parameters.params))
    type: ansatz-params
  - target_distribution: ((get-bars-and-stripes-distribution.distribution))
    type: bitstring-distribution
  outputs:
    - name: qcbm-optimization-results
      type: optimization-results
    - name: optimized-parameters
      type: ansatz-params

types:
 - ansatz-params
 - bitstring-distribution
 - optimization-results
```

**6. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/)

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `optimize-qcbm-circuit.yaml` by running `qe submit workflow <path/to/workflow/optimize-qcbm-circuit.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: qcbm-opt-l2btk
```

**7. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50
Namespace:           default
Status:              Succeeded
Created:             Wed Sep 09 19:46:38 +0000 (3 minutes ago)
Started:             Wed Sep 09 19:46:38 +0000 (3 minutes ago)
Finished:            Wed Sep 09 19:50:01 +0000 (19 seconds ago)
Duration:            3 minutes 23 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            projects/v1

STEP                                                          PODNAME                                                   DURATION  MESSAGE
  qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50 (qeDagWorkflow)
 ├- get-bars-and-stripes-distribution (get-bars-and-stripes-distribution)  qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292  18s       distribution
 ├- get-initial-parameters (get-initial-parameters)                        qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077  34s       params
 └- optimize-circuit (optimize-circuit)                                    qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-741618460   2m        qcbm-optimization-results,optimized-parameters
 ```

This output shows the status of the execution of the steps in your workflow.

**8. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        qcbm-opt-l2btk
Location:    http://13.86.58.178:9000/workflow-results/6c1c82e0-ce10-5eb2-8842-7fe060a6b98c.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200721%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200721T195101Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%226c1c82e0-ce10-5eb2-8842-7fe060a6b98c.json%22&X-Amz-Signature=36f0c62810f4613fc2e15978ea5d97807dc59f92bca66465c4bd9b7319a8b59f
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___

**9. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file

This file will look like the following. (Note that we have formatted and truncated the file for readability.)

```JSON
{
    "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292": {
        "class": "get-bars-and-stripes-distribution",
        "distribution": {
            "bitstring_distribution": {
                "0000": 0.16666666666666666,
                "0011": 0.16666666666666666,
                "0101": 0.16666666666666666,
                "1010": 0.16666666666666666,
                "1100": 0.16666666666666666,
                "1111": 0.16666666666666666
            },
            "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292/distribution",
            "schema": "zapata-v1-bitstring-probability-distribution",
            "stepName": "get-bars-and-stripes-distribution",
            "stepId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292",
            "workflowId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50"
        },
        "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "workflowId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50"
    },
    "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077": {
        "class": "get-initial-parameters",
        "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "params": {
            "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077/params",
            "parameters": {
                "real": [
                    -1.5374251567989021,
                    0.005886219347039701,
                    -0.013271859558781296,
                    -1.1497752790678715,
                    -1.123771191672749,
                    -0.8837257585341144,
                    -0.2558843131971793,
                    -0.7909623311814244,
                    -1.3060526953408007,
                    -0.4851342702417438,
                    -1.0463222718885108,
                    1.1886755285725494,
                    1.41602705930789,
                    -1.4483300998865158,
                    0.6251972089921096,
                    0.2284658208879451,
                    1.2497423512269699,
                    0.524062774967659,
                    0.1502106387659521,
                    0.6356221115736933,
                    -0.35646168740995066,
                    0.6105374481803987,
                    1.0200932585317213,
                    -0.10780098734678512,
                    1.3832466459137003,
                    0.9537428778386781,
                    1.517748039424404,
                    -1.0373421511869714,
                    0.06620599398376359,
                    1.3989246893053957,
                    0.4695570543238954,
                    1.1330122389286876
                ]
            },
            "schema": "zapata-v1-circuit_template_params",
            "stepName": "get-initial-parameters",
            "stepId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077",
            "workflowId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50"
        },
        "workflowId": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50"
    },
    "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-741618460": {
        "class": "optimize-circuit",
        "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-741618460",
        "inputArtifact:initial_parameters": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077/params",
        "inputArtifact:target_distribution": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292/distribution",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "optimized-parameters": {
            "id": "qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-741618460/optimized-parameters",
            "parameters": {
                "real": [
                    -2.5036601724777223,
                    -0.027797857736315386,
                    0.4326403682034262,
                    -0.3944843948778366,
                    ...
```

The sections `qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-2874596292`, `qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077`, and `qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-741618460` (which we don't show for brevity) correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the step that was executed and its inputs and outputs. For example, the `get-initial-parameters` step (`qcbm-opt-dc0976a4-0367-4579-b0e1-b58af0842f50-4235178077`) has an output called `params` which contains the randomly generated parameters for the circuit. More information on the contents of this file are found on the [Workflow Results via JSON page](../../data-management/workflow-result/).

___


## Plotting the results

In order to plot the training process, we use the file `plot_qcbm_opt_history.py`. In the `z-quantum-qcbm` repository, you can find it in the folder named `examples`. This plots the results from the existing `qcbm_example.json` file, but if you'd like to plot the results of your own training, please change the name to your json file in line 22.

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
with open('qcbm_example.json') as f:
    data = json.load(f)

# Extract lists of energies, bond lengths, and basis sets.
distances = []
minimum_distances = []
bistring_distributions = []

current_minimum = 100000
for step_id in data:
    step = data[step_id]
    if step["class"] == "optimize-circuit":
        ordered_bitstrings = get_ordered_list_of_bitstrings(4)

        for evaluation in step["qcbm-optimization-results"]["history"]:
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

![](../../img/tutorials/qcbm-results.png)
*The results.*
---
title: "Simulate H₂ with VQE"
summary: Calculate the equilibrium bond length of H₂ with a variational quantum eigensolver.
weight: 6
publishdate: 2099-01-01
---

An [example workflow for simulating a H₂ molecule with VQE](https://github.com/zapatacomputing/z-quantum-vqe/blob/master/examples/hydrogen.yaml) is available in [`z-quantum-vqe`](https://github.com/zapatacomputing/z-quantum-vqe). More details coming soon!

<!-- 
This tutorial will walk through using the Orquestra Quantum Engine to implement the Variational Quantum Eigensolver (VQE) to calculate the binding energy curve of a H₂ molecule.

## Composing a workflow to calculate the Hartree-Fock energy

To help illustrate the process of composing a workflow, we will start by focusing on just part of the VQE process.
We will build a two-step workflow that first creates the geometry of a hydrogen molecule and then performs a Hartree-Fock calculation.
Furthermore, we will build our own Quantum Engine component for the first step (the creation of the molecular geometry).
For the second step, we will use an existing Quantum Engine component, `qe-psi4`, that exposes the functionality of the Psi4 quantum chemistry package.

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `diatomic-molecule`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help

This repository will be where you build your component. [This GitHub repo](https://github.com/zapatacomputing/tutorial-1-diatomic-molecule) can be used as a reference for how the `diatomic-molecule` component should look like throughout the tutorial.

**2. Add python code to the repository**

Using either the GitHub UI or by cloning your repo and using the command line, create a file `src/diatomicmolecule.py` with the contents below:

```python
"""Function for building a diatomic molecule."""

def create_diatomic_molecule_geometry(species1, species2, bond_length):
    """Create a molecular geometry for a diatomic molecule.

    Args:
        species1 (str): Chemical symbol of the first atom, e.g. 'H'.
        species2 (str): Chemical symbol of the second atom.
        bond_length (float): bond distance.

    Returns:
        dict: a dictionary containing the coordinates of the atoms.
    """

    geometry = {"sites": [
        {'species': species1, 'x': 0, 'y': 0, 'z': 0},
        {'species': species2, 'x': 0, 'y': 0, 'z': bond_length}
    ]}

    return geometry
```

**3. Adding a `setup.py`**

Create a file `src/setup.py` with the following contents:

```python
import setuptools

setuptools.setup(
    name="diatomic-molecule",
    version="0.1.0",
    py_modules=['diatomicmolecule']
)
```

**4. Commit and push your component**

Commit your changes and push them to GitHub.
(Note that you will not need to do this if you are using the GitHub UI to modify the repository.)
The structure of your repository should look like this:
```
.
└─ src
   ├── diatomicmolecule.py
   └── setup.py
```

**5. Building a Workflow**

Create a file `hartree-fock-workflow.yaml` file with the code below, inserting the URL of your github repository in line 13.

# TODO: Update this to v1 standards
```YAML
# Workflow API version
ZapOSApiVersion: v1alpha1

# Declares this as workflow
kind: Workflow

# List resources needed by workflow.
resources:

- name: diatomic-molecule
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"
- name: z-quantum-core
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: qe-openfermion
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-openfermion.git"
    branch: "master"
- name: qe-psi4
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-psi4.git"
    branch: "master"

# Data to help you easily work with your workflow
metadata:

  # Prefix for workflow ID
  generateName: hartree-fock-

# Data for running the workflow
spec:

  # Think of this as identifying the `main` function -- this tells the workflow which template to start with
  entrypoint: run-h2

  # Initializing global variables for use in workflow
  arguments:
    parameters:

    # Where output data is stored -- Must be `quantum-engine` for compatibility with Orquestra data services
    - s3-bucket: quantum-engine
    # Path where output data is stored within the `s3-bucket` -- can be anything you want
    - s3-key: tutorials/hartree-fock/

  # The steps of the workflow
  templates:
  - name: run-h2
    steps:

    # Create the molecular geometry
    - - name: create-molecule
        template: create-diatomic-molecule
        arguments:
          parameters:
          - species1: H
          - species2: H
          - bond-length: '0.7'
          - resources: [diatomic-molecule]
          - docker-image: z-quantum-default
          - docker-tag: latest

    # Perform a Hartree-Fock calculation using Psi4
    - - name: run-psi4
        template: run-psi4
        arguments:
          artifacts:
          - geometry:
              from: '{{steps.create-molecule.outputs.artifacts.geometry}}'
          parameters:
          - basis: STO-3G
          - method: scf # ccsd(t)
          - reference: rhf
          - nthreads: "4"
          - save-hamiltonian: 'False' # Boolean values must be put in quotes!
          - resources: [z-quantum-core, qe-openfermion, qe-psi4]
          - docker-image: qe-psi4
          - docker-tag: latest
```

**6. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/)

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `hartree-fock-workflow.yaml` by running `qe submit workflow <path/to/workflow/hartree-fock-workflow.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: welcome-to-orquestra-d9djf
```

**7. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
 # TODO: Update this to v1 standards
```Bash
Name:                hartree-fock-4772f
Namespace:           default
ServiceAccount:      default
Status:              Succeeded
Created:             Tue Apr 07 17:35:31 +0000 (2 minutes ago)
Started:             Tue Apr 07 17:35:31 +0000 (2 minutes ago)
Finished:            Tue Apr 07 17:37:45 +0000 (41 seconds ago)
Duration:            2 minutes 14 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            tutorials/hartree-fock/

STEP                                               STEPNAME                        DURATION  MESSAGE
 ✔ hartree-fock-4772f (run-h2)
 ├---✔ create-molecule (create-diatomic-molecule)  hartree-fock-4772f-1985307964  19s
 └---✔ run-psi4 (run-psi4)                         hartree-fock-4772f-1924622246  1m
 ```

This output shows the status of the execution of the steps in your workflow.

**8. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        hartree-fock-4772f
Location:    http://40.89.251.200:9000/workflow-results/3dcdd240-f5c6-5c78-a80a-9aa86a6941b5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200407%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200407T191718Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%223dcdd240-f5c6-5c78-a80a-9aa86a6941b5.json%22&X-Amz-Signature=d1107e50f741c002c7fe0d328bafec5ef52afb3819a93c02ef1f19b4f56d59a4
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___

**9. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file

This file will look like the following:

# TODO: Update this to v1 standards
```JSON
{
    "hartree-fock-z78cn-734196932": {
        "class": "run-psi4",
        "energycalc-results": {
            "energy": -1.1173735079951446,
            "id": "hartree-fock-z78cn-734196932/energycalc-results",
            "n_alpha": 1,
            "n_beta": 1,
            "n_frozen_core": 0,
            "n_frozen_valence": 0,
            "n_mo": 2,
            "schema": "io-zapOS-v1alpha1-energy_calc",
            "stepName": "run-psi4",
            "stepId": "hartree-fock-z78cn-734196932",
            "workflowId": "hartree-fock-z78cn"
        },
        "id": "hartree-fock-z78cn-734196932",
        "inputArtifact:geometry": "hartree-fock-z78cn-1709410626/geometry",
        "inputParam:basis": "STO-3G",
        "inputParam:charge": "0",
        "inputParam:command": "bash main_script.sh",
        "inputParam:cpu": "1000m",
        "inputParam:disk": "10Gi",
        "inputParam:docker-image": "qe-psi4",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "inputParam:freeze-core": "False",
        "inputParam:freeze-core-extract": "False",
        "inputParam:memory": "1024Mi",
        "inputParam:method": "scf",
        "inputParam:multiplicity": "1",
        "inputParam:n-active": "None",
        "inputParam:n-active-extract": "None",
        "inputParam:nthreads": "4",
        "inputParam:options": "None",
        "inputParam:reference": "rhf",
        "inputParam:save-hamiltonian": "False",
        "workflowId": "hartree-fock-z78cn"
    },
    "hartree-fock-z78cn-1709410626": {
        "class": "create-diatomic-molecule",
        "geometry": {
            "id": "hartree-fock-z78cn-1709410626/geometry",
            "schema": "zapata-v1-molecular_geometry",
            "sites": [
                {
                    "id": "hartree-fock-z78cn-1709410626/geometry_sites[0]",
                    "parentId": "hartree-fock-z78cn-1709410626/geometry",
                    "parentType": "zapata-v1-molecular_geometry",
                    "species": "H",
                    "workflowId": "hartree-fock-z78cn",
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "zapata-v1-molecular_geometry_sites_index": 0
                },
                {
                    "id": "hartree-fock-z78cn-1709410626/geometry_sites[1]",
                    "parentId": "hartree-fock-z78cn-1709410626/geometry",
                    "parentType": "zapata-v1-molecular_geometry",
                    "species": "H",
                    "workflowId": "hartree-fock-z78cn",
                    "x": 0,
                    "y": 0,
                    "z": 0.7,
                    "zapata-v1-molecular_geometry_sites_index": 1
                }
            ],
            "stepName": "create-diatomic-molecule",
            "stepId": "hartree-fock-z78cn-1709410626",
            "workflowId": "hartree-fock-z78cn"
        },
        "id": "hartree-fock-z78cn-1709410626",
        "inputParam:bond-length": "0.7",
        "inputParam:command": "python3 main_script.py",
        "inputParam:cpu": "1000m",
        "inputParam:disk": "10Gi",
        "inputParam:docker-image": "open_pack_psi4",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "inputParam:memory": "1024Mi",
        "inputParam:species1": "H",
        "inputParam:species2": "H",
        "workflowId": "hartree-fock-z78cn"
    }
}
```

# TODO: Update with correct IDs
The sections `welcome-to-orquestra-d9djf-1289017430` and `welcome-to-orquestra-d9djf-2235995037` correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the step that was executed, any input parameters or input artifacts, and the output artifacts. The artifact `geometry` is the output of the `create-diatomic-molecule` step, and the artifact `energycalc-results` is the output of the `run-psi4` step. More information on the contents of this file are found on the [Workflow Results via JSON page](../../data-management/workflow-result/).

___
**Note:** The sections in this results file will not necessarily be in the order that they were executed.
___

## Running VQE

Here we walk through running a workflow that performs a VQE calculation for different bond lengths and basis sets, and plot the results.

**1. Building the Workflow**

Create a file `vqe-workflow.yaml` file with the code below, inserting the URL of your github repository in line 8.

# TODO: Update this to v1 standards
```yaml
ZapOSApiVersion: v1alpha1
kind: Workflow

resources:
- name: diatomic-molecule
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"
- name: z-quantum-core
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-core.git"
    branch: "master"
- name: qe-openfermion
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-openfermion.git"
    branch: "master"
- name: qe-psi4
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/qe-psi4.git"
    branch: "master"
- name: z-quantum-vqe
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/z-quantum-vqe.git"
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


# Specify the prefix to use when generating names of workflow executions.
metadata:
  generateName: h2-example-

# The actual workflow specification
spec:

  entrypoint: basis-set-loop
  arguments:
    parameters:
    - s3-bucket: quantum-engine
    - s3-key: projects/examples/hydrogen/data
    - docker-image: 'z-quantum-default'
    - docker-tag: 'latest'

  templates:

  - name: basis-set-loop
    steps:
    - - name: bond-length-loop
        template: bond-length-loop
        arguments:
          parameters:
          - basis: '{{item}}' # Note that quotes are needed here because of the curly braces
        withItems:
        - STO-3G
        # - 6-31G
        # - 6-311G

  - name: bond-length-loop
    inputs:
      parameters:
      - name: basis
    steps:
    - - name: run-h2
        template: run-h2
        arguments:
          parameters:
          - basis: '{{inputs.parameters.basis}}'
          - bond-length: '{{item}}'
        withItems: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

  - name: run-h2
    inputs:
      parameters:
      - name: basis
      - name: bond-length
    steps:
    - - name: create-molecule
        template: create-diatomic-molecule
        arguments:
          parameters:
          - species1: H
          - species2: H
          - bond-length: '{{inputs.parameters.bond-length}}'
          - resources: [z-quantum-core, diatomic-molecule]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"

    - - name: run-psi4
        template: run-psi4
        arguments:
          artifacts:
          - geometry:
              from: '{{steps.create-molecule.outputs.artifacts.geometry}}'
          parameters:
          - basis: '{{inputs.parameters.basis}}'
          - method: scf # ccsd(t)
          - reference: rhf
          - nthreads: "4"
          - save-hamiltonian: 'True' # Boolean values must be put in quotes!
          - resources: [z-quantum-core, qe-openfermion, qe-psi4]
          - docker-image: qe-psi4
          - docker-tag: latest
    - - name: transform-hamiltonian
        template: transform-interaction-operator
        arguments:
          artifacts:
          - input-op:
              from: "{{steps.run-psi4.outputs.artifacts.hamiltonian}}"
          parameters:
          - transformation: Jordan-Wigner
          - resources: [z-quantum-core, qe-openfermion]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"

    - - name: generate-random-ansatz-params
        template: generate-random-ansatz-params
        arguments:
          parameters:
          - ansatz-specs: "{'module_name': 'zquantum.vqe.singlet_uccsd', 'function_name': 'SingletUCCSDAnsatz', 'number_of_spatial_orbitals': {{steps.run-psi4.outputs.parameters.n-mo}}, 'number_of_alpha_electrons': {{steps.run-psi4.outputs.parameters.n-alpha}}, 'transformation': 'Jordan-Wigner'}"
          - min-val: "-0.01"
          - max-val: "0.01"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-vqe]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"

    - - name: optimize-variational-circuit
        template: optimize-variational-circuit
        arguments:
          parameters:
          - ansatz-specs: "{'module_name': 'zquantum.vqe.singlet_uccsd', 'function_name': 'SingletUCCSDAnsatz', 'number_of_spatial_orbitals': {{steps.run-psi4.outputs.parameters.n-mo}}, 'number_of_alpha_electrons': {{steps.run-psi4.outputs.parameters.n-alpha}}, 'transformation': 'Jordan-Wigner'}"
          - backend-specs: "{'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}"
          - optimizer-specs: "{'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B'}"
          - cost-function-specs: "{'module_name': 'zquantum.core.cost_function', 'function_name': 'AnsatzBasedCostFunction', 'estimator-specs': { 'module_name': 'zquantum.core.estimator', 'function_name': 'ExactEstimator'}}"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-qhipster, z-quantum-vqe]
          - docker-image: qe-qhipster
          - docker-tag: latest
          - memory: 2048Mi
          artifacts:
          - qubit-operator:
              from: "{{steps.transform-hamiltonian.outputs.artifacts.transformed-op}}"
          - initial-parameters:
              from: "{{steps.generate-random-ansatz-params.outputs.artifacts.params}}"
```

**2. Running the Workflow**

Submit your `vqe-workflow.yaml` by running `qe submit workflow <path/to/workflow/vqe-workflow.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: h2-example-p8l8z
```

**3. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
 # TODO: Update this to v1 standards
```Bash
Name:                h2-example-p8l8z
Namespace:           default
ServiceAccount:      default
Status:              Succeeded
Created:             Wed Jul 22 18:20:48 +0000 (32 minutes ago)
Started:             Wed Jul 22 18:20:48 +0000 (32 minutes ago)
Finished:            Wed Jul 22 18:43:15 +0000 (10 minutes ago)
Duration:            22 minutes 27 seconds
Parameters:          
  s3-bucket:         quantum-engine
  s3-key:            projects/examples/hydrogen/data
  docker-image:      z-quantum-default
  docker-tag:        latest

STEP                                          TEMPLATE                        STEPNAME                      DURATION  MESSAGE
 ✔ h2-example-p8l8z                           basis-set-loop                                                           
 └-·-✔ bond-length-loop(0:STO-3G)             bond-length-loop                                                         
   | └-·-✔ run-h2(0:0.5)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-320671787   25s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-2276207559  1m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-777027899   52s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2306285369  4m          
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-4156831192  3m          
   |   ├-✔ run-h2(1:0.6)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-1858781165  24s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-2844980177  1m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3241092549  52s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2925732603  4m          
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3771386018  1m          
   |   ├-✔ run-h2(2:0.7)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-2489090355  23s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1782402399  4m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-2577316179  41s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-367227601   36s         
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3310949536  3m          
   |   ├-✔ run-h2(3:0.8)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-718502689   20s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-3296753909  53s         
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3276629793  53s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-4024689623  1m          
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-2004269862  3m          
   |   ├-✔ run-h2(4:0.9)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-659958291   26s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1077837631  4m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-789538867   41s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2281753649  38s         
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3950100096  3m          
   |   └-✔ run-h2(5:1)                        run-h2                                                                   
   |     ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-3114661174  25s         
   |     ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-626212344   4m          
   |     ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3286196550  42s         
   |     ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2806389460  1m          
   |     └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-485685399   2m          
   ├-✔ bond-length-loop(1:6-31G)              bond-length-loop                                                         
   | └-·-✔ run-h2(0:0.5)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-2201321403  24s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-147427127   1m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-619701451   2m          
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-828786185   44s         
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-985592200   3m          
   |   ├-✔ run-h2(1:0.6)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-3112625597  27s         
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-498889601   2m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-4020169301  34s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2730937611  4m          
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-1118428050  3m          
   |   ├-✔ run-h2(2:0.7)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-2039281475  3m          
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-55215375    6m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3648812195  29s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-1885521121  31s         
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-1587777616  2m          
   |   ├-✔ run-h2(3:0.8)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-963451889   1m          
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-3837272869  1m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3111880625  31s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-3371042023  5m          
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-4045147670  1m          
   |   ├-✔ run-h2(4:0.9)                      run-h2                                                                   
   |   | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-3189860195  2m          
   |   | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1606785455  3m          
   |   | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3094855875  52s         
   |   | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-1008295553  33s         
   |   | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-948889456   2m          
   |   └-✔ run-h2(5:1)                        run-h2                                                                   
   |     ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-808302054   1m          
   |     ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-2150190728  2m          
   |     ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-2893748982  44s         
   |     ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-1719652996  1m          
   |     └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-989228711   2m          
   └-✔ bond-length-loop(2:6-311G)             bond-length-loop                                                         
     └-·-✔ run-h2(0:0.5)                      run-h2                                                                   
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-4150500325  2m          
       | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1072637817  1m          
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-4170937933  1m          
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-4075034787  36s         
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3226937690  11m         
       ├-✔ run-h2(1:0.6)                      run-h2                                                                   
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-26219435    1m          
       | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-2628181575  2m          
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-1041197243  1m          
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2692445881  46s         
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3768791128  12m         
       ├-✔ run-h2(2:0.7)                      run-h2                                                                   
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-206219261   2m          
       | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-4190137153  3m          
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-1436588693  53s         
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-593545547   3m          
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-1910195794  12m         
       ├-✔ run-h2(3:0.8)                      run-h2                                                                   
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-2218833135  2m          
       | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-757288811   6m          
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3592088935  2m          
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-1817350341  37s         
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-3063744844  10m         
       ├-✔ run-h2(4:0.9)                      run-h2                                                                   
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-2798315261  2m          
       | ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1988032577  5m          
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-1143398805  30s         
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-2651385931  30s         
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-604431186   10m         
       └-✔ run-h2(5:1)                        run-h2                                                                   
         ├---✔ create-molecule                create-diatomic-molecule        h2-example-p8l8z-478082596   3m          
         ├---✔ run-psi4                       run-psi4                        h2-example-p8l8z-1365653886  1m          
         ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-p8l8z-3045958644  45s         
         ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-p8l8z-1614823978  38s         
         └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-p8l8z-594085341   14m 
```

This output shows the status of the execution of the steps in your workflow.

**4. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        h2-example-p8l8z
Location:    http://13.86.58.178:9000/workflow-results/c7acd521-67ed-5f59-8af4-90039b947ed8.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200722%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200722T185615Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22c7acd521-67ed-5f59-8af4-90039b947ed8.json%22&X-Amz-Signature=52a6f99bace35826603e2247c98b368df3eeb3dc21b8a8801df000aaceacefd6
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___

**5. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file.

**6. Plotting the Results**

* Copy the python script below into the same directory as the JSON file.
* In the python script, replace the name of the JSON file with the name of the JSON file that you have downloaded in Step 7.
* Run the python script to plot the calculated binding energy curve.


```python
"""Plot the VQE binding energy curve of a diatomic molecule from a Quantum
Engine workflow result JSON."""

import json
from matplotlib import pyplot as plt

# Insert the path to your JSON file here
with open('31de8df6-12fa-5b22-b9a9-e7e09e5b7c33.json') as f:
    data = json.load(f)

# Extract lists of energies, bond lengths, and basis sets.
energies = []
bond_lengths = []
basis_sets = []
for task in data:
    if data[task]['class'] == 'optimize-variational-circuit':
        qubit_op = data[task]['inputArtifact:qubit-operator']
        qubit_op_creator = qubit_op.split('/')[0]
        interaction_op = data[qubit_op_creator]['inputArtifact:input-op']
        interaction_op_creator = interaction_op.split('/')[0]
        geometry = data[interaction_op_creator]['inputArtifact:geometry']
        geometry_creator = geometry.split('/')[0]
        bond_lengths.append(float(data[geometry_creator]['inputParam:bond-length']))
        energies.append(data[task]['optimization-results']['opt_value'])
        basis_sets.append(data[interaction_op_creator]['inputParam:basis'])

# Group the bond lengths and energies according to the basis set, and sort by
# bond length.
bond_length_sets = []
energy_sets = []
basis_set_list = list(set(basis_sets))
for basis in basis_set_list:
    indices = [i for i, x in enumerate(basis_sets) if x == basis]
    bond_length_sets.append([bond_lengths[i] for i in indices])
    energy_sets.append([energies[i] for i in indices])
    bond_length_sets[-1], energy_sets[-1] = zip(*sorted(zip(bond_length_sets[-1], energy_sets[-1]), key=lambda x: x[0]))

# Plot the binding energy curve
plt.figure()
for i in range(len(basis_set_list)):
    plt.plot(bond_length_sets[i], energy_sets[i], marker='o')

plt.xlabel('Bond length (Angstroms)')
plt.ylabel('Energy (Ha)')
plt.legend(basis_set_list)
plt.tight_layout()
plt.show()
``` -->
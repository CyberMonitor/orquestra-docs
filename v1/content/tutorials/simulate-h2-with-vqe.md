---
title: "Simulate H₂ with VQE"
summary: Calculate the equilibrium bond length of H₂ with a variational quantum eigensolver.
weight: 2
---

This tutorial will walk through using Quantum Engine to use the Variational Quantum Eigensolver (VQE) to calculate the binding energy curve of a H₂ molecule.

## Composing a workflow to calculate the Hartree-Fock energy

To help illustrate the process of composing a workflow, we will start by focusing on just part of the VQE process.
We will build a two-step workflow that first creates the geometry of a hydrogen molecule and then performs a Hartree-Fock calculation.
Furthermore, we will build our own Quantum Engine resource for the first step (the creation of the molecular geometry).
For the second step, we will use an existing Quantum Engine resource, `qe-psi4`, that exposes the functionality of the Psi4 quantum chemistry package.

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `diatomic-molecule`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help

This repository will be where you build your resource. [This GitHub repo](https://github.com/zapatacomputing/tutorial-1-diatomic-molecule) can be used as a reference for how the `diatomic-molecule` resource should look like throughout the tutorial.

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

**4. Adding `templates`**

Create a file `templates/diatomic-molecule.yaml` with the following contents:

```yaml
spec:
  templates:

  # Create a diatomic moleucle
  - name: create-diatomic-molecule
    parent: generic-task
    inputs:
      parameters:
      - name: species1
      - name: species2
      - name: bond-length
      - name: command
        value: python3 main_script.py
      artifacts:
      - name: main-script
        path: /app/main_script.py
        raw:
          data: |
            import json
            from diatomicmolecule import create_diatomic_molecule_geometry
            geometry = create_diatomic_molecule_geometry('{{inputs.parameters.species1}}',
                                                         '{{inputs.parameters.species2}}',
                                                         {{inputs.parameters.bond-length}})

            geometry['schema'] = "molecular_geometry"
            with open('molecule.json', 'w') as f:
              f.write(json.dumps(geometry))
    outputs:
      artifacts:
      - name: geometry
        path: /app/molecule.json
```

**5. Commit and push your resource**

Commit your changes and push them to GitHub.
(Note that you will not need to do this if you are using the GitHub UI to modify the repository.)
The structure of your repository should look like this:
```
.
├── src
│   ├── diatomicmolecule.py
│   └── setup.py
└── templates
    └── diatomic-molecule.yaml
```

**6. Building a Workflow**

Create a file `hartree-fock-workflow.yaml` file with the code below, inserting the URL of your github repository in line 13.

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

**7. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](https://www.orquestra.io/docs/qe/cli/install/)

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `hartree-fock-workflow.yaml` by running `qe submit workflow <path/to/workflow/hartree-fock-workflow.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: welcome-to-orquestra-d9djf
```

**8. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
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

**9. Workflow Results**

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

**10. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file

This file will look like the following:

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
            "taskClass": "run-psi4",
            "taskId": "hartree-fock-z78cn-734196932",
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
            "taskClass": "create-diatomic-molecule",
            "taskId": "hartree-fock-z78cn-1709410626",
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

The sections `welcome-to-orquestra-d9djf-1289017430` and `welcome-to-orquestra-d9djf-2235995037` correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the template that was executed for the given step, any input parameters or input artifacts, and the output artifacts. The artifact `welcome` is the output of the `greeting` template, and the artifact `zessage` is the output of the `transform-welcome` template. More information on the contents of this file are found on the [Workflow Results via JSON page](https://www.orquestra.io/docs/dcs/data/json/).

___
**Note:** The sections in this results file will not necessarily be in the order that they were executed.
___

## Running VQE

Here we walk through running a workflow that performs a VQE calculation for different bond lengths and basis sets, and plot the results.

**1. Building the Workflow**

Create a file `vqe-workflow.yaml` file with the code below, inserting the URL of your github repository in line 8.

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
    - docker-image: z-quantum-default
    - docker-tag: latest

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
    - - name: build-vqe-circuit-template
        template: build-vqe-circuit-template
        arguments:
          parameters:
          - ansatz-type: singlet UCCSD
          - n-alpha: "{{steps.run-psi4.outputs.parameters.n-alpha}}"
          - n-beta: "{{steps.run-psi4.outputs.parameters.n-beta}}"
          - n-mo: "{{steps.run-psi4.outputs.parameters.n-mo}}"
          - transformation: Jordan-Wigner
          - resources: [z-quantum-core, qe-openfermion, z-quantum-vqe]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
    - - name: generate-random-ansatz-params
        template: generate-random-ansatz-params
        arguments:
          parameters:
          - min-val: "-0.01"
          - max-val: "0.01"
          - resources: [z-quantum-core]
          - docker-image: "{{workflow.parameters.docker-image}}"
          - docker-tag: "{{workflow.parameters.docker-tag}}"
          artifacts:
          - ansatz:
              from: "{{steps.build-vqe-circuit-template.outputs.artifacts.ansatz}}"
    - - name: optimize-variational-circuit
        template: optimize-variational-circuit
        arguments:
          parameters:
          - backend-specs: "{'module_name': 'qeqhipster.simulator', 'function_name': 'QHipsterSimulator'}"
          - optimizer-specs: "{'module_name': 'zquantum.optimizers.scipy_optimizer', 'function_name': 'ScipyOptimizer', 'method': 'L-BFGS-B'}"
          - resources: [z-quantum-core, qe-openfermion, z-quantum-optimizers, qe-qhipster, z-quantum-vqe]
          - docker-image: qe-qhipster
          - docker-tag: latest
          - memory: 2048Mi
          artifacts:
          - ansatz:
              from: "{{steps.build-vqe-circuit-template.outputs.artifacts.ansatz}}"
          - qubit-operator:
              from: "{{steps.transform-hamiltonian.outputs.artifacts.transformed-op}}"
          - initial-parameters:
              from: "{{steps.generate-random-ansatz-params.outputs.artifacts.params}}"
```

**2. Running the Workflow**

Submit your `vqe-workflow.yaml` by running `qe submit workflow <path/to/workflow/vqe-workflow.yaml>`**

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: welcome-to-orquestra-d9djf
```

**3. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                h2-example-pgjqn
Namespace:           default
ServiceAccount:      default
Status:              Succeeded
Created:             Wed May 27 20:01:14 +0000 (13 minutes ago)
Started:             Wed May 27 20:01:14 +0000 (13 minutes ago)
Finished:            Wed May 27 20:14:15 +0000 (53 seconds ago)
Duration:            13 minutes 1 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            projects/examples/hydrogen/data
  docker-image:      z-quantum-default
  docker-tag:        latest

STEP                                          TEMPLATE                        STEPNAME                      DURATION  MESSAGE
 ✔ h2-example-pgjqn                           basis-set-loop
 └---✔ bond-length-loop(0:STO-3G)             bond-length-loop
     └-·-✔ run-h2(0:0.5)                      run-h2
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-459287451   13s
       | ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-3701025175  1m
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-227587627   39s
       | ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-2915280385  4m
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-1258479298  18s
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-277052611   5m
       ├-✔ run-h2(1:0.6)                      run-h2
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-3859637789  17s
       | ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-2429965665  1m
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-1835944885  1m
       | ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-1962660295  52s
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-2820032448  25s
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-2019040637  1m
       ├-✔ run-h2(2:0.7)                      run-h2
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-2056975651  16s
       | ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-3288310255  2m
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-1414541955  27s
       | ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-2657700217  36s
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-1647483866  22s
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-1326408107  1m
       ├-✔ run-h2(3:0.8)                      run-h2
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-2149814865  27s
       | ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-2559710341  1m
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-1140246545  1m
       | ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-1795518539  4m
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-3399831252  20s
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-408735425   1m
       ├-✔ run-h2(4:0.9)                      run-h2
       | ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-1553207875  32s
       | ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-3522094607  1m
       | ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-2104670115  4m
       | ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-2453503897  37s
       | ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-3758409978  3m
       | └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-2209202635  1m
       └-✔ run-h2(5:1)                        run-h2
         ├---✔ create-molecule                create-diatomic-molecule        h2-example-pgjqn-2628476742  1m
         ├---✔ run-psi4                       run-psi4                        h2-example-pgjqn-1014206440  1m
         ├---✔ transform-hamiltonian          transform-interaction-operator  h2-example-pgjqn-3314116694  30s
         ├---✔ build-vqe-circuit-template     build-vqe-circuit-template      h2-example-pgjqn-3876819994  41s
         ├---✔ generate-random-ansatz-params  generate-random-ansatz-params   h2-example-pgjqn-1434761943  19s
         └---✔ optimize-variational-circuit   optimize-variational-circuit    h2-example-pgjqn-1218854764  1m
```

This output shows the status of the execution of the steps in your workflow.

**4. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        welcome-to-orquestra-d9djf
Location:    http://40.89.251.200:9000/workflow-results/bb2b58b4-b25d-59e3-9fee-e7b79f0c20d5.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200319%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200319T212017Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22bb2b58b4-b25d-59e3-9fee-e7b79f0c20d5.json%22&X-Amz-Signature=c4de1784b252fa6164aea8aa49a91bdd84c20c4dc55411e93f69a57b4ea62ac1
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
```
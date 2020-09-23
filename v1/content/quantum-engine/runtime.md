---
title: Runtime
summary: Runtimes provide a framework to ensure the environment where a step runs is consistent
weight: 3
---

### Overview
When requesting a step to run as part of a workflow, Orquestra provides the connection between the underlying infrastructure and your step through the use of the runtime.

Runtimes provide a lifecycle framework for steps in a workflow as follows:
- ensure all Orquestra components are available in the step context
- aid in type checking all inputs to the step
- deserialize input data
- ensure the step has all dependencies required to run successfully
- run the step
- serialize output data

### Using Runtimes
How to use a runtime in a workflow step can be found [here](../quantum-engine/steps/#runtime) 

Each runtime must specify a `language`. This language determines what software language is utilized during a step of the workflow.

### Where do Runtime Languages come from?

Orquestra comes with a "core" runtime language type to cover the common use case `python3`. This runtime is open source and can be found [here](https://github.com/zapatacomputing/python3-runtime).

Other runtime languages can be community developed, deployed and then used within your runtime as well.

### How do Runtime Languages work?

Each runtime language must contain the following three binaries:

`install` determines and sets up what is required to support this runtime language.
`supply` provides all dependencies for this step.
`run` ensure all types of inputs are correct types, calls the required functions or commands (with correct inputs) to run the step.

### Python3

Supported Python Versions:
* Python 3.x

When requesting python3 code to run within a step of the workflow, set the `language` key to `python3`.
Additionally both the desired python3 `file` and `function` to run should be specified under the `parameters` key.

Below is an example:

```yaml
steps:
- name: helloworkflow
  config:
    runtime:
      language: python3                               # <-----------------
      parameters:
        file: hellov1/src/python/orquestra/main.py    # <-----------------
        function: main                                # <-----------------
```

#### Dependency Management
While there are no restrictions on how to organize source code when using the python3 runtime, Orquestra does provides automatic installation of python dependencies as follows:

1. with pip using `requirements.txt` file in the root directory of your component
1. with pip using `setup.py` file in the root directory of your component
1. with pip using `vendor/` directory in the root directory of your component

**NOTE:**
To ensure proper installation of dependencies, it is recommended to package vendor'd dependencies as non-binary. The following `pip download` command achieves this.

```sh
$ cd YOUR-COMPONENT-DIR
$ mkdir -p vendor

# vendors pip *.tar.gz into vendor/
$ pip download -r requirements.txt --no-binary=:none: -d vendor
```

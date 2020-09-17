---
title: Workflow Basics
summary: An overview of Orquestra workflows.
weight: 1
---

## Overview

Workflows are the language used to provide the Quantum Engine step-by-step instructions of which actions to perform on which data.

As explained in [why workflows?](../../getting-started/why-workflows/), here at Zapata we have found workflows to be a naturally expressive, easily extensible, and highly shareable means to perform our scientific experiments. With Orquestra, we hope to create a community of scientists and developers alike that will enable everyone to make quicker discoveries and achieve **real** value.

## One Step at a Time

Below we will step through the basics of the Orquestra workflow language by building a workflow from scratch.

### Workflow Declarations

At the beginning of every workflow, we define the workflow API version

These will always be set to `io.orquestra.workflow/1.0.0` for the current version of Orquestra

```YAML
# Workflow API version
apiVersion: io.orquestra.workflow/1.0.0
```

### Components

Components contain the definitions and implementations of the functions that one can perform from within a workflow. To learn more about what comprises a component and how to build one yourself, check out out the [components](../../quantum-engine/components/) page.

To use a component, there must be a reference to it in the `imports` section of your workflow. References to components have 3 required fields:
- `name`: this is the name of your component and the way you can reference a given component in your `step` declaration. This does not need to match the name of the repository the component comes from
- `type`: currently only `git` component types are supported
- `parameters`: this is a list of various parameters specific to the type of component

For a `git` component, there are two required fields under `parameters`:
-  `url`: the location of the git repository (syntax shown below)
-  `branch`: the branch of the repository containing the desired version

```YAML
# List components needed by workflow.
imports:

# A component named `welcome-to-orquestra` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome-to-orquestra
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/tutorial-0-welcome.git"
    branch: "master"
```

### Name

Each workflow run in Orquestra is assigned a randomly generated workflow ID. For the sake of clarity and record keeping, the `name` key allows you to set the prefix of each workflow ID.

```YAML
# Prefix for workflow ID
name: welcome-to-orquestra-
```

Using this example workflow, a possible workflow ID would be: `welcome-to-orquestra-97d0b34c-9dab-4055-8330-96b82e039193`

### Steps

The `steps` block is the most important section of a workflow. This is where you define the step-by-step instructions of your workflow for the Quantum Engine to execute. Each step needs a name, a `runtime`, the amount of compute resources specified, and what the inputs and outputs to the step are.

#### Name

In the example below, we define a step named `greeting`

```YAML
steps:
# `salutations` is the name of a step in this workflow
- name: salutations
```

#### Runtime

This is written under the `config` section of the step. The runtime specifies how the Quantum Engine will interpret/compile the source code in your component. Currently, the only supported runtime type is `python3`.

Under runtime you will also specify what source code you would like to run from what component. In order to do that, specify the component(s) that the source code will require and the relative path to the source code in that component.

In this example, we're running the `welcome` function in the `welcome.py` file which requires the `welcome-to-orquestra component`. Note that the path to the file starts with the component it can be found in.

```YAML
  config:
    runtime:
      type: python3
      imports: [welcome-to-orquestra]
      parameters:
        file: welcome-to-orquestra/welcome.py
        function: welcome
```

#### Resources

Also under the `config` section, this is where the amount of compute resources can be specified. If no options are given, the defaults are:

```YAML
cpu: "1000m"
memory: "1Gi"
disk: "10Gi"
```

In our case, we want just a bit more disk space than the default, so we're going to set that value to `15Gi`

```YAML
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "15Gi"
```

#### Outputs

In this section, you specify the name and the type of the output(s) you are expecting from the step. This output will be a JSON file and the `name` field needs to match the name of the file (without the .json). The `type` field can be whatever you want it to be, just make sure you specify it later in unter the `types` tag.

For our example, the `name` of this output is "welcome" and the `type` is "message"

```YAML
  outputs:
  - name: welcome
    type: message
```

### Types

At the very end of your workflow, you will need a `types` tag that specifies the types you returned from your steps.

```YAML
types:
- message
```

## Putting it all together

Here is a complete, functional workflow that has all of these components:

```YAML
# Workflow API version
apiVersion: io.orquestra.workflow/1.0.0

# Prefix for workflow ID
name: hello-workflow

# List components needed by workflow.
imports:

# A component named `welcome-to-orquestra` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome-to-orquestra
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/tutorial-0-welcome"
    branch: "master"

steps:

# This step runs the `welcome` function in the `welcome-to-orquestra` resource
- name: greeting
  config:
    runtime:
      type: python3
      imports: [welcome-to-orquestra]
      parameters:
        file: welcome-to-orquestra/welcome.py
        function: welcome
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "15Gi"
  outputs:
  - name: welcome
    type: message

types:
- message
```

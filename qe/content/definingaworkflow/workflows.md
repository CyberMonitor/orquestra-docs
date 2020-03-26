---
title: Workflow Basics
description: The workflow engine of the Orquestra platform
---

## Overview

Workflows are the language of Orquestra used by the Quantum Engine as 
step-by-step instructions of which actions to perform on which data. 

As explained in [Why Workflows?](https://orquestra.io/docs/basics/why-workflows/), 
here at Zapata we have found workflows to be a naturally expressive, easily 
extensible, and highly shareable means to perform our scientific experiments. 
With Orquestra, we hope to create a community of scientists and developers alike 
that will allow everyone to make quicker discoveries and achieve **real** value.

Below we will step through the basics of the Orquestra workflow language by
building a workflow from scratch.

## One Step at a Time

#### Workflow Declarations

At the beginning of every workflow, we define two key-words
1.  `ZapOSApiVersion`
2. `kind`

These will always be set to the values of `v1alpha` and `Workflow` respectively 
for the current version of Orquestra.

```YAML
# Workflow API version
ZapOSApiVersion: v1alpha1

# Declares this as workflow
kind: Workflow
```

#### Resources

Resources contain the definitions and implementations of the functions that one
can perform from within a workflow. To learn more about what comprises a
resource and how to build one yourself, check out out the 
[Resources](https://orquestra.io/docs/qe/definingaworkflow/resources) page.

For all resources, there are 3 required fields:
- `name`: this is the name of your resource and the way you can reference a
given resource in your `step` declaration (TODO: add step description link)
- `type`: currently only `git` resource types are supported
- `parameters`: this is a list of various parameters specific to the type of 
resource. For a `git` resource, there are two required parameters:
  -  `url`: the location of the git repository (syntax shown below)
  -  `branch`: the branch of the repository containing the desired version

```YAML
# List resources needed by workflow.
resources:

# A resource named `welcome` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"
```

#### Metadata

Each workflow run in Orquestra is assinged a randomly generated workflow ID that 
is assumed to be unique. For the sake of clarity and record keeping, the 
`generateName` key inside of the `metadata` block allows you to set the prefix 
of each workflow ID. 


```YAML
# Data to help you easily work with your workflow
metadata:

  # Prefix for workflow ID
  generateName: welcome-to-orquestra-
```

Using this example workflow, a possible workflow ID would be: `welcome-to-orquestra-3ks9w`

#### Spec

The `spec` block of the workflow file contains the majority of the information 
regarding the execution process defined by the workflow. This section contains
3 main components: 
1. `entrypoint`
2. `spec`
3. `templates`

Below, we will describe what each component is responsible for.

##### Entrypoint

The `entrypoint` key is simple, it tells the Quantum Engine which template your 
workflow starts with. 

In the example below, the `entrypoint` is set to `saluations`, indicating that 
the workflow begins on the `saluations` template.

```YAML
# Data for running the workflow
spec:

  # Think of this as identifying the `main` function -- this tells the workflow which template to start with
  entrypoint: salutations
```

##### Arguments

Inside of the `arguments` section of the `spec`, we have a set of 
"workflow parameters" that we can both create and define. 

These "workflow parameters" can be thought of as global parameters for the
workflow and can be referenceed in any `step` using the syntax: `{{workflow.parameters.<parameter name>}}`. Later in the `step` section we will show this
in more detail (TODO: link to step section). 

As shown in the example below, there are two **required** workflow parameters.
- `s3-bucket`: this should always be set to `quantum-engine` for the current
version of Orquestra
- `s3-key`: this value determines the organization of your data within
Orquestra's data management system. 

To keep your data separated from others', it
is always useful to make the `s3-key` something relative to your workflow.


```YAML
# Data for running the workflow
spec:

  # Initializing global variables for use in workflow
  arguments:
    parameters:

    # Where output data is stored -- Must be `quantum-engine` for compatibility with Orquestra data services
    - s3-bucket: quantum-engine
    # Path where output data is stored within the `s3-bucket` -- can be anything you want
    - s3-key: tutorials/welcome/
```

##### Templates


```YAML
# Data for running the workflow
spec:

  # The steps of the workflow
  templates:

  # `salutations` is a template that just contains a list of `steps`, which are other templates
  - name: salutations
    steps:

    # This template runs the `welcome-to-orquestra` template in the `welcome` resource
    - - name: greeting
        template: welcome-to-orquestra
        arguments:
          parameters:
          - resources: [welcome]
```


## Putting it all together

```YAML
# Workflow API version
ZapOSApiVersion: v1alpha1

# Declares this as workflow
kind: Workflow

# List resources needed by workflow.
resources:

# A resource named `welcome` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"

# Data to help you easily work with your workflow
metadata:

  # Prefix for workflow ID
  generateName: welcome-to-orquestra-

# Data for running the workflow
spec:

  # Think of this as identifying the `main` function -- this tells the workflow which template to start with
  entrypoint: salutations

  # Initializing global variables for use in workflow
  arguments:
    parameters:

    # Where output data is stored -- Must be `quantum-engine` for compatibility with Orquestra data services
    - s3-bucket: quantum-engine
    # Path where output data is stored within the `s3-bucket` -- can be anything you want
    - s3-key: tutorials/welcome/

  # The steps of the workflow
  templates:

  # `salutations` is a template that just contains a list of `steps`, which are other templates
  - name: salutations
    steps:

    # This template runs the `welcome-to-orquestra` template in the `welcome` resource
    - - name: greeting
        template: welcome-to-orquestra
        arguments:
          parameters:
          - resources: [welcome]
```

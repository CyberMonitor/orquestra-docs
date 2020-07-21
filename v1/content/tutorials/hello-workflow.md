---
title: "Hello Workflow"
summary: Start here to learn how to build workflows with Orquestra.
weight: 1
---

This tutorial will cover the key components in a Quantum Engine workflow and walk you through the process of building your first workflow.

## Concepts
Every workflow is built with a `spec` that executes `templates`. A `template` is a step in the workflow that describes the context of the work to be done, e.g. the code to be executed, the inputs, and outputs. Templates are distributed via `resources`, which represent a versioned set of templates from an external source.

### Templates

Templates are analogous to functions. They define the inputs they take in, the actions to be performed, and the outputs they produce. Templates can be defined once and reused multiple times within a workflow.

There are also two kinds of templates, **resource templates** and **workflow templates**. To understand more about both types as well as the similarities and differences between the two, refer to the [templates page](../../quantum-engine/templates/).

### Resources

Resources are a way of making both templates and source code reusable and shareable.

A resource is made of two components: the source code that will be executed and the template that calls that code. To learn more about what comprises a resource as well as how to build your own, please refer to the [resources page](../../quantum-engine/resources/).

## Building a Workflow

There are three steps to building a workflow:

1. Create one or more templates and associated source code (optional)

1. Make templates and code available as a resource (optional)

1. Incorporate the resource into a workflow

Note: Steps 1 and 2 are optional if you reuse existing resources.

## Hello Workflow

Let's put these concepts into practice by building our first workflow. In this tutorial we will be:
- Building a resource. A new resource will let you incorporate existing code into the workflow.
- Writing templates that utilize resources to create in the `step` of a workflow.

We could create a very minimalistic workflow without using resources, but we would miss out on what makes Quantum Engine powerful: sharing reusable templates and source code. We will start by showing you how to build your own resource.

### Building a Resource

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `welcome-resource`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

This repository will be where you build your resource. [This GitHub repo](https://github.com/zapatacomputing/tutorial-0-welcome) can be used as a reference for how `welcome-resource` should look like throughout the tutorial.

**2. Creating the Resource Folder Structure**

In order to be recognized by Orquestra, a resource must contain two folders:
- The `src/` folder which contains:
  - A `setup.py` file that is responsible for installing your code in the machine where your workflow is executed. This installation is done automatically for you conforming to [Python3 setuptools standard](https://docs.python.org/3/distutils/setupscript.html) for Setup Scripts.
  - A nested folder `python/` containing source code.
- The `templates/` folder which will hold the templates used by code in the `src/` folder.

Using either the GitHub UI or by cloning your repo and using the command line create two folders at the root level of the repository, `src/` and `templates/`.

___
The structure we want to have is shown in more detail on the [resources page](../../quantum-engine/resources/).

___

**3. Adding `welcome.py` to `src/`**

Our goal in the first part of this tutorial is to create a resource that produces an [artifact](../../data-management/workflow-artifacts/) with the text `Welcome to Orquestra!` when used within a workflow.

We will start by adding some code to the `src/` folder. In general, Orquestra can support any Python3 source that is installable via `pip` using a `setup.py` script.

Moving into the `src/` folder, create a folder structure `python/orquestra/` and with a python script in it called `welcome.py`. Your repo structure should now look like this:

```
.
├── src
│   ├── python
│   │   └── orquestra
│   │       └── welcome.py
│   └── setup.py
├── templates
```

Open `welcome.py` in an editor and add the following code:

```Python
"""
This module saves a welcome message.
"""

import json

def welcome():
    message = "Welcome to Orquestra!"

    message_dict = {}
    message_dict["message"] = message
    message_dict["schema"] = "message"

    with open("welcome.json",'w') as f:
        f.write(json.dumps(message_dict, indent=2)) # Write message to file as this will serve as output artifact
```

**Note:**

- All artifacts must have a `schema` field. More details on artifacts are found on the [artifacts page](../../data-management/workflow-artifacts/).

- We create the file `welcome.json` because any output has to be saved in a file in order to be passed on to the next step or to be accessible for data analysis after the workflow has completed. We will see how to pass it on to another step later in this tutorial.

**4. Initializing the Python Package**

This `welcome` package will need an initialization file. Create a file called `__init__.py` under `src/python/orquestra/` with the following code snippet:

```Python
from .welcome import *
```

**5. Adding a `setup.py`**

We need to create a `setup.py` file that lets Orquestra know how to install the `welcome.py` source code. Create a new file `setup.py` under `src/` with the following code snippet:

```Python
import setuptools

setuptools.setup(
    name                            = "orquestra",
    packages                        = setuptools.find_packages(where = "python"),
    package_dir                     = {
        "" : "python"
    },
    classifiers                     = (
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ),
)
```

For clarity, in this example:
- `name` is the name of your package which you can reference in your template
- `packages` tells the installer to look for a subdirectory called `python`
which contains your source code
- `package_dir` allows the contents of the `python` directory to be imported
without the python path prefix, for example, with `from orquestra import all`

For more information regarding how to make your source code available as a `package`, please refer to the [setuptools documentation](https://setuptools.readthedocs.io/en/latest/setuptools.html#developer-s-guide).

**6. Adding `templates`**

Now that we have the code that we want the resource to execute, we'll work on defining the `welcome` template for this resource. Move into the `templates/` folder and create a new file called `welcome.yaml`.

**Template**

The `welcome.yaml` resource template is responsible for invoking Python code that lives under `src/`. This can be done using the following snippet:

```YAML
# Every template YAML file must begin with a `spec`, without which your template won't compile.
spec:

  # The `templates` section is where you list one or more templates
  templates:

  # This is the name of the template, which is used to reference it in the workflow. This field is required.
  - name: welcome-to-orquestra

    # `generic-task` is the supertemplate that all templates (that don't contain a `steps` section) must inherit from
    parent: generic-task

    # This section is for the inputs needed to run the template. This section is required.
    inputs:

      # `parameters` represent initialization values for a template.
      parameters:

      # The `command` parameter is required because that is what is run by `generic-task`.
      - name: command
        value: python3 main.py

      # This section creates a script called `main.py` containing the code below under `data`. It must be under the `app` directory in order for the command above to locate it.
      artifacts:
      - name: main-script
        path: /app/main.py
        raw:
          data: |
            from orquestra import welcome
            welcome()

    # This section is where output artifacts are listed. They must be listed here, or else they will get deleted when the template completes. They must be under the `app` directory in order to be saved.
    outputs:
      artifacts:
      - name: welcome
        path: /app/welcome.json
```

Please refer to the [templates page](../../quantum-engine/templates/) for a more in-depth explanation of each of the fields in the above resource template.


**7. Push Your Resource**

Having added our code under `src/` and defined our template under `templates/`, the final structure of the resource should resemble the following:

```
.
├── src
│   ├── python
│   │   └── orquestra
│   │       ├── __init__.py
│   │       └── welcome.py
│   └── setup.py
├── templates
│   └── welcome.yaml
```

Once you are satisified with your work, commit your changes and push them to Github

**8. Building a Workflow**

We can now build a simple workflow that uses the `welcome` git resource to generate the welcome message artifact. Let's start by creating a `welcome-workflow.yaml` file with the following code:

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
___
**Note**: Do not forget to update the resource url - `"git@github.com:<your-github-username>/<your-git-repo-name>.git"` - with the location of your resource.

___

Please refer to the [workflow basics page](../../quantum-engine/workflow-basics/) for a more in-depth explanation of each of the fields in the sample workflow above.


**9. Adding Resources to the Workflow**

Next, we will see how to use a pre-existing resource and explore one possible pattern for a workflow with multiple steps.

For example, Zapata already has build a [transform message resource](https://github.com/zapatacomputing/tutorial-0-ztransform.git) with a git-URL of `https://github.com/zapatacomputing/tutorial-0-ztransform.git`. This resource translates a message you give it in a fun way.

Open up `welcome-workflow.yaml` and add a new block under `resources` after the `welcome` resource:

```YAML
# List resources needed by workflow.
resources:

# A resource named `welcome` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome
  type: git
  parameters:
    url: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"

- name: ztransform
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/tutorial-0-ztransform.git"
    branch: "master"
```

This pre-built resource has a resource template called `z-transformation` along with the associated source code. By putting this resource in your workflow, you can now reference the `z-transformation` resource template. We'll do this by adding a step, `transform-welcome`, under the salutations workflow template in `welcome-workflow.yaml`:

The following is the `templates` section of `welcome-workflow.yaml` with the new step added:
```YAML
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

    # This template runs the `z-transformation` template in the `ztransform` resource
    - - name: transform-welcome
        template: z-transformation
        arguments:
          parameters:
          - resources: [ztransform]
          artifacts:
          - name: message
            # This template takes in the output artifact from the `welcome` template.
            from: '{{steps.greeting.outputs.artifacts.welcome}}'
```

There is now a second step with the name `transform-welcome`. This step uses the resource template `z-transformation` from the resource you just added. The template `z-transformation` takes in an artifact as input. To understand how the `welcome` artifact is passed from the `greeting` step to the `transform-welcome` step, check out the "Referencing Step Outputs" section of the [steps page](../../quantum-engine/steps/).

**10. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/).

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `welcome-workflow.yaml` by running `qe submit workflow <path/to/workflow/welcome-workflow.yaml>`.

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: welcome-to-orquestra-d9djf
```

**11. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                welcome-to-orquestra-d9djf
Namespace:           default
ServiceAccount:      default
Status:              Succeeded
Created:             Thu Mar 19 21:14:33 +0000 (5 minutes ago)
Started:             Thu Mar 19 21:14:33 +0000 (5 minutes ago)
Finished:            Thu Mar 19 21:19:49 +0000 (19 seconds ago)
Duration:            5 minutes 16 seconds
Parameters:
  s3-bucket:         quantum-engine
  s3-key:            tutorials/welcome/

STEP                                         STEPNAME                                DURATION  MESSAGE
 ✔ welcome-to-orquestra-d9djf (salutations)
 ├---✔ greeting (welcome-to-orquestra)       welcome-to-orquestra-d9djf-2235995037  5m
 └---✔ transform-welcome (z-transformation)  welcome-to-orquestra-d9djf-1289017430  13s
```

This output shows the status of the execution of the steps in your workflow.

**12. Workflow Results**

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

**13. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file.

This file will look like the following (except for the comments, which were added in this tutorial for clarity):

```JSON
{
    "welcome-to-orquestra-d9djf-2235995037": { # The step that executed the `greeting` task
        "class": "welcome-to-orquestra",
        "id": "welcome-to-orquestra-d9djf-2235995037",
        "inputParam:command": "python3 main.py",
        "inputParam:cpu": "1000m",
        "inputParam:disk": "10Gi",
        "inputParam:docker-image": "zmachine_default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "inputParam:memory": "1024Mi",
        "welcome": { # An artifact called `welcome`
            "id": "welcome-to-orquestra-d9djf-2235995037/welcome",
            "message": "Welcome to Orquestra!", # The message generated by this template
            "schema": "message",
            "taskClass": "welcome-to-orquestra",
            "taskId": "welcome-to-orquestra-d9djf-2235995037",
            "workflowId": "welcome-to-orquestra-d9djf"
        },
        "workflowId": "welcome-to-orquestra-d9djf"
    },
    "welcome-to-orquestra-d9djf-1289017430": { # The step that executed the `transform-welcome` task
        "class": "z-transformation",
        "id": "welcome-to-orquestra-d9djf-1289017430",
        "inputArtifact:message": "welcome-to-orquestra-d9djf-2235995037/welcome",
        "inputParam:command": "python3 main.py",
        "inputParam:cpu": "1000m",
        "inputParam:disk": "10Gi",
        "inputParam:docker-image": "zmachine_default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "inputParam:memory": "1024Mi",
        "workflowId": "welcome-to-orquestra-d9djf",
        "zessage": { # An artifact called `zessage`
            "id": "welcome-to-orquestra-d9djf-1289017430/zessage",
            "message": "Zelcome Zo Zrquestra!", # The message after it was transformed
            "schema": "message",
            "taskClass": "z-transformation",
            "taskId": "welcome-to-orquestra-d9djf-1289017430",
            "workflowId": "welcome-to-orquestra-d9djf"
        }
    }
}
```

The sections `welcome-to-orquestra-d9djf-1289017430` and `welcome-to-orquestra-d9djf-2235995037` correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the template that was executed for the given step, any input parameters or input artifacts, and the output artifacts. The artifact `welcome` is the output of the `greeting` template, and the artifact `zessage` is the output of the `transform-welcome` template. More information on the contents of this file are found on the [workflow results via JSON page](../../data-management/workflow-result/).

___
**Note:** The sections in this results file will not necessarily be in the order that they were executed.
___

## Summary

We have now seen how to construct a working workflow from its elemental components: workflows, templates, and resources.

Additionally, we submitted a workflow to Quantum Engine and got its result in JSON format.
This hopefully introduced some of the key concepts and mechanics in using Orquestra Quantum Engine.

## Completed Tutorial Materials

For your convenience, here are the completed resources and workflow:

[Welcome resource](https://github.com/zapatacomputing/tutorial-0-welcome)

[ZTransform resource](https://github.com/zapatacomputing/tutorial-0-ztransform)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.yaml)

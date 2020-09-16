---
title: "Hello Component"
summary: Learn how to build workflow components with Orquestra.
weight: 2
---

This tutorial will cover the basic steps of running your own code in an Orquestra workflow, which is done using `components`. Before you do this tutorial, please [install the Quantum Engine CLI](../../qe-cli/install-cli).

## Concepts
Every workflow executes a series of `steps`. A `step` is a portion of the workflow that describes the context of the work to be done, e.g. the code to be executed, the inputs, and outputs. The `runtime` tag specifies how a `step` should be executed. Currently the only supported `runtime` is for Python 3. The `imports` tag specifies `components` where the code to be executed in the `steps` is to be found. Currently, the only supported type of `component` is a git repository.

## Building a Workflow

There are three steps to building a workflow:

1. Make code available as a component (optional)

1. Incorporate the component into a workflow using the `imports` tag

1. Call the code in a step of the workflow

Note: Step 1 is optional if you reuse existing components

## Hello Component

Let's put these concepts into practice by building our first component. In this tutorial we will be:
- Building a component. A new component will let you incorporate existing code into the workflow.
- Utlizing code from the component in a workflow

Our [Hello Workflow](../hello-workflow) tutorial goes more in depth to the parts of the workflow itself. In this tutorial, you'll use a pre-existing workflow.

### Building a component

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `welcome-component`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

This repository will be where you build your component. [This GitHub repo](https://github.com/zapatacomputing/tutorial-0-welcome) can be used as a reference for how `welcome-component` should look like throughout the tutorial.

**2. Creating the Component Folder Structure**

In order to be recognized as a python package by Orquestra, a component should contain a source folder with a setup.py inside so that the 
- The `src/` folder which contains:
  - A `setup.py` file that is responsible for installing your code in the machine where your workflow is executed. This installation is done automatically for you conforming to [Python3 setuptools standard](https://docs.python.org/3/distutils/setupscript.html) for Setup Scripts.
  - A nested folder `python/` containing source code.

Using either the GitHub UI or by cloning your repo and using the command line create the folder `src/` at the root of your repository.

___
The structure we want to have is shown in more detail on the [Components page](https://www.orquestra.io/docs/qe/workflow/resources/).

___

**3. Adding `welcome.py` to `welcome-component`**

Our goal in the first part of this tutorial is to create a component that produces an [artifact](../../data-management/workflow-artifacts/) with the text `Welcome to Orquestra!` when used within a workflow.

We will start by adding some code to the `src/` folder. In general, Orquestra can support any Python3 source that is installable via `pip` using a `setup.py` script.

Moving into the `src/` folder, create a folder structure `python/orquestra/` with a python script in it called `welcome.py`. Your repo structure should now look like this:

```
.
└── src
    ├── python
    │   └── orquestra
    │       └── welcome.py
    └── setup.py
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

We create the file `welcome.json` because any output has to be saved in a file in order to be passed on to the next step or to be accessible for data analysis after the workflow has completed. We will see how to pass it on to another step later in this tutorial.

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

**6. Push Your component**

The final structure of your repository should look like this:
```
.
└── src
    ├── python
    │   └── orquestra
    │       ├── __init__.py
    │       └── welcome.py
    └── setup.py
```

Once you are satisified with your work, commit your changes and push them to Github

**7. Building a Workflow**

We can now build a simple workflow that uses the `welcome` git component to generate the welcome message artifact. Let's start by creating a `welcome-workflow.zqwl` file with the following code:

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
    repository: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
    branch: "master"
- name: ztransformation
  type: git
  parameters:
    url: "git@github.com:zapatacomputing/tutorial-0-ztransform.git"
    branch: "master"

steps:

# This step runs the `welcome` function in the `welcome-to-orquestra` component
- name: greeting
  config:
    runtime:
      type: python3
      imports: [welcome-to-orquestra]
      parameters:
        file: welcome-to-orquestra/src/python/orquestra/welcome.py
        function: welcome
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "15Gi"
  outputs:
  - name: welcome
    type: message
- name: transform-welcome
  passed: [greeting]
  config:
    runtime:
      type: python3
      imports: [ztransform]
      parameters:
        file: ztransform/tasks/ztransformation.py
        function: z_transformation
  inputs:
    - message: ((greeting.welcome))
      type: message
  outputs:
    - name: zelcome
      type: zessage

types:
- message
- zessage
```
___
**Note**: Do not forget to update the component url - `"git@github.com:<your-github-username>/<your-git-repo-name>.git"` - with the location of your component.
___

Please refer to the [workflow basics page](../../quantum-engine/workflow-basics/) for a more in-depth explanation of each of the fields in the sample workflow above.

You'll notice that there is already a second step in the workflow, called `transform-welcome` which uses an existing component `ztransformation`. This pre-built component has a python script called `ztransform` with a function that's also called `ztransform`. The function `ztransform` takes in an artifact as input. To understand how the `welcome` artifact is passed from the `greeting` step to the `transform-welcome` step, check out the "Referencing Step Outputs" section of the [steps page](../../quantum-engine/steps/).

By putting this component in your workflow, you can now reference it in a step, as we have done in the above workflow. For more information on what is required to build the workflow above, see the [Hello Workflow](../hello-workflow) tutorial.

### Running the Workflow

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/).

**1. Login and submit the workflow**

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `welcome-workflow.yaml` by running `qe submit workflow <path/to/workflow/welcome-workflow.yaml>`.

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
```

**2. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
Namespace:           default
Status:              Succeeded
Created:             Tue Sep 15 17:42:00 +0000 (1 minute ago)
Started:             Tue Sep 15 17:42:00 +0000 (1 minute ago)
Finished:            Tue Sep 15 17:42:19 +0000 (1 minute ago)
Duration:            19 seconds
Parameters:          
  s3-bucket:         quantum-engine
  s3-key:            projects/v1

STEP                                                          PODNAME                                                         DURATION  MESSAGE
  hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1 (qeDagWorkflow)                                                                                     
 ├- greeting (greeting)                                                hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381  9s        welcome  
 └- transform-welcome (transform-welcome)                              hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-2975662367  8s        zelcome
```

This output shows the status of the execution of the steps in your workflow.

**3. Workflow Results**

To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

After a workflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
Location:    http://a49397a7334b711ea99a80ac353ea38d-1340393531.us-east-1.elb.amazonaws.com:9000/workflow-results/hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200915%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200915T193213Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1.json%22&X-Amz-Signature=3366f8eb8b0701d1bce40c329f6a3a42a1c73f603d93b7ced22b99e181a6a67d
```
___
**Note:** The above link is only valid temporarily and typically expires after 7 days.
___

**4. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file.

This file will look like the following (except for the comments, which were added in this tutorial for clarity):

```JSON
{
    "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381": { # The step that executed the `greeting` task
        "class": "greeting",
        "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "welcome": { # An artifact called `welcome`
            "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381/welcome",
            "message": "Welcome to Orquestra!", # The message generated by this template
            "schema": "message",
            "taskClass": "greeting",
            "taskId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381",
            "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
        },
        "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
    },
    "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-2975662367": { # The step that executed the `transform-welcome` task
        "class": "transform-welcome",
        "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-2975662367",
        "inputArtifact:message": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381/welcome",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1",
        "zelcome": { # An artifact called `zelcome`
            "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-2975662367/zelcome",
            "message": "Zelcome Zo Zrquestra!", # The message generated by this template
            "schema": "message",
            "taskClass": "transform-welcome",
            "taskId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-2975662367",
            "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
        }
    }
}
```

The sections `hello-workflow-36779dcb- ... -3219967381` and `hello-workflow-36779dcb- ... -2975662367` correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the step that was executed, any input parameters or input artifacts, and the output artifacts. The artifact `welcome` is the output of the `greeting` step, and the artifact `zessage` is the output of the `transform-welcome` step. More information on the contents of this file are found on the [workflow results via JSON page](../../data-management/workflow-result/).

___
**Note:** The sections in this results file will not necessarily be in the order that they were executed.
___

## Summary

We have now seen how to construct a working workflow from its elemental components: workflows and components.

Additionally, we submitted a workflow to Quantum Engine and got its result in JSON format.
This hopefully introduced some of the key concepts and mechanics in using Orquestra Quantum Engine.

## Completed Tutorial Materials

For your convenience, here are the completed components and workflow:

[Welcome component](https://github.com/zapatacomputing/tutorial-0-welcome)

[ZTransform component](https://github.com/zapatacomputing/tutorial-0-ztransform)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.zqwl)

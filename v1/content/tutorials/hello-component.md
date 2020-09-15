---
title: "Hello Component"
summary: Learn how to build workflow components with Orquestra.
weight: 2
---

This tutorial will cover the key components in a Quantum Engine workflow and walk you through the process of building your first workflow.

## Concepts
Every workflow executes a series of `steps`. A `step` is a task in the workflow that describes the context of the work to be done, e.g. the code to be executed, the inputs, and outputs. The `runtime` tag specifies how a `step` should be executed. Currently the only supported `runtime` is for Python 3. The `imports` tag specifies `resources` where the code to be executed in the `steps` is to be found. Currently, the only supported type of `resource` is a git repository.

## Building a Workflow

There are three steps to building a workflow:

1. Make code available as a resource (optional)

1. Incorporate the resource into a workflow using the `imports` tag

1. Call the code in a step of the workflow

Note: Step 1 is optional if you reuse existing resources.

## Hello Workflow

Let's put these concepts into practice by building our first workflow. In this tutorial we will be:
- Building a resource. A new resource will let you incorporate existing code into the workflow.
- Writing workflows that utilize resources in their `steps`.

We could create a very minimalistic workflow without using resources, but we would miss out on what makes Quantum Engine powerful: sharing reusable source code. We will start by showing you how to build your own resource.

### Building a Resource

**1. Create a GitHub repository**

Go to [GitHub](https://github.com/) and create a public repository called `welcome-resource`. If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

This repository will be where you build your resource. [This GitHub repo](https://github.com/zapatacomputing/tutorial-0-welcome) can be used as a reference for how `welcome-resource` should look like throughout the tutorial.

**2. Adding `welcome.py` to `welcome-resource`**

Our goal in the first part of this tutorial is to create a resource that produces an [artifact](../../data-management/workflow-artifacts/) with the text `Welcome to Orquestra!` when used within a workflow.

In order to be recognized by the Orquestra python runtime, a resource must contain a python source code file containing a callable. Create a new file in the root directory of the git repository and name it `welcome.py`. In an editor and add the following code:

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


**3. Push Your Resource**

Once you are satisified with your work, commit your changes and push them to Github

**4. Building a Workflow**

We can now build a simple workflow that uses the `welcome` git resource to generate the welcome message artifact. Let's start by creating a `welcome-workflow.zqwl` file with the following code:

```YAML
# Workflow API version
apiVersion: io.orquestra.workflow/1.0.0

# Prefix for workflow ID
name: hello-workflow

# List resources needed by workflow.
imports:

# A resource named `welcome-to-orquestra` that is a public git repo. All the fields here are required except branch, which defaults to master.
- name: welcome-to-orquestra
  type: git
  parameters:
    repository: "git@github.com:<your-github-username>/<your-git-repo-name>.git"
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
___
**Note**: Do not forget to update the resource url - `"git@github.com:<your-github-username>/<your-git-repo-name>.git"` - with the location of your resource.

___

Please refer to the [workflow basics page](../../quantum-engine/workflow-basics/) for a more in-depth explanation of each of the fields in the sample workflow above.


**5. Adding Resources to the Workflow**

Next, we will see how to use a pre-existing resource and explore one possible pattern for a workflow with multiple steps.

For example, Zapata already has built a [transform message resource](https://github.com/zapatacomputing/tutorial-0-ztransform.git) with a git-URL of `https://github.com/zapatacomputing/tutorial-0-ztransform.git`. This resource translates a message you give it in a fun way.

Open up `welcome-workflow.zqwl` and add a new block under `imports` after the `welcome` resource:

```YAML
# List resources needed by workflow.
imports:

# A resource named `welcome-to-orquestra` that is a public git repo. All the fields here are required except branch, which defaults to master.
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
```

This pre-built resource has a python script called `ztransform` with a function that's also called `ztransform`. By putting this resource in your workflow, you can now reference it in a step. Add a step, `transform-welcome`, under the `welcome` step in `welcome-workflow.zqwl`:

The following is the `steps` section of `welcome-workflow.zqwl` with the new step added:
# TODO: Update this to match the correct step structure w/ passing artifacts from one to another
```YAML
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

# This step runs the `z-transform` script in the `ztransformation` resource
- name: transform-welcome
  config:
    runtime: python3
    imports: [ztransformation]
    parameters:
      file: ztransformation/src/python/orquestra/ztransform.py
      function: ztransform
    resources:
      cpu: "1000m"
      memory: "1Gi"
      disk: "15Gi"
    outputs:
    - name: zessage
      type: zessage
```

There is now a second step with the name `transform-welcome`. This step uses the function `ztransform` from the resource `ztransformation` you just added. The function `ztransform` takes in an artifact as input. To understand how the `welcome` artifact is passed from the `greeting` step to the `transform-welcome` step, check out the "Referencing Step Outputs" section of the [steps page](../../quantum-engine/steps/).

**6. Running the Workflow**

You are now ready to run the workflow!

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/).

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `welcome-workflow.yaml` by running `qe submit workflow <path/to/workflow/welcome-workflow.yaml>`.

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: welcome-to-orquestra-d9djf
```

**7. Worfklow Progress**

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

**8. Workflow Results**

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

**9. Downloading the Results**

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file.

This file will look like the following (except for the comments, which were added in this tutorial for clarity):

#TODO: Update this JSON

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
            "message": "Welcome to Orquestra!", # The message generated by this step
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

The sections `welcome-to-orquestra-d9djf-1289017430` and `welcome-to-orquestra-d9djf-2235995037` correspond to the steps that were run by your workflow. Note that these IDs match those in the output of `qe get workflow`. Each of these sections contains information about the step that was executed, any input parameters or input artifacts, and the output artifacts. The artifact `welcome` is the output of the `greeting` step, and the artifact `zessage` is the output of the `transform-welcome` step. More information on the contents of this file are found on the [workflow results via JSON page](../../data-management/workflow-result/).

___
**Note:** The sections in this results file will not necessarily be in the order that they were executed.
___

## Summary

We have now seen how to construct a working workflow from its elemental components: workflows and resources.

Additionally, we submitted a workflow to Quantum Engine and got its result in JSON format.
This hopefully introduced some of the key concepts and mechanics in using Orquestra Quantum Engine.

## Completed Tutorial Materials

For your convenience, here are the completed resources and workflow:

[Welcome resource](https://github.com/zapatacomputing/tutorial-0-welcome)

[ZTransform resource](https://github.com/zapatacomputing/tutorial-0-ztransform)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.zqwl)

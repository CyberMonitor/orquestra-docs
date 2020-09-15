---
title: "Hello Workflow"
summary: Start here to learn how to build workflows with Orquestra.
weight: 1
---

This tutorial will cover the key components in a Quantum Engine workflow and walk you through the process of building your first workflow. Before you do this tutorial, please [install the Quantum Engine CLI](../../qe-cli/install-cli)

## Concepts
Every workflow executes a series of `steps`. A `step` is a portion of the workflow that describes the context of the work to be done, e.g. the code to be executed, the inputs, and outputs. The `runtime` tag specifies how a `step` should be executed. Currently the only supported `runtime` is for Python 3. The `imports` tag specifies `components` where the code to be executed in the `steps` is to be found. Currently, the only supported type of `component` is a git repository.

## Building a Workflow

There are three steps to building a workflow:

1. Make code available as a component (optional)

1. Incorporate the component into a workflow using the `imports` tag

1. Call the code in a step of the workflow

Note: Step 1 is optional if you reuse existing components (as we will do in this tutorial).

## Hello Workflow

Let's put these concepts into practice by building our first workflow. In this tutorial we will be:
- Building a workflow.
- Running the workflow.

In our [Hello Component](../hello-component) tutorial you will see how to build and incorporate your own components into a workflow. In this tutorial, we're going to use a pre-existing component so you don't have to built it yourself.

**1.Building a Workflow**

Orquestra allows you to run others' code with minimal setup by creating a workflow (or using one they provide) that references another's components. More can be found about components on the [Components page](https://www.orquestra.io/docs/qe/workflow/resources/), and the [Hello Component](../hello-component) tutorial shows you how to build your own.

For this tutorial, Zapata has a pre-existing component [here](https://github.com/zapatacomputing/tutorial-0-welcome) containing code you can run in your workflow. To import it, start by creating a file called `welcome-workflow.zwql` with the following code:

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
    branch: "workflow-v1"
```

In this section, we specifiy the version, the name of the workflow, and what component we're importing. Next, we'll actually run code from the `welcome-to-orquestra` component in a step in the workflow. Copypaste the following code into your welcome-workflow.zqwl file after the `welcome-to-orquestra` component:

```YAML
steps:

# This step runs the `welcome` function in the `welcome-to-orquestra` component
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
```

The final step is just to add a `types` tag to the end of the workflow specifying the types that are outputted by the step(s) of your workflow. In this case, we just need to add the `message` type.

```YAML
types:
- message
```

That's it! A full workflow completely created! Please refer to the [workflow basics page](../../quantum-engine/workflow-basics/) for a more in-depth explanation of each of the fields in the sample workflow above. Now let's run the workflow!


### Running the Workflow

* Make sure you have installed the [Quantum Engine CLI](../../qe-cli/install-cli/).

* Log in to Quantum Engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.

* Submit your `welcome-workflow.zqwl` by running `qe submit workflow <path/to/workflow/welcome-workflow.zqwl>`.

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like:
```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
```

**1. Worfklow Progress**

The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the previous step substituted in.

 The output will look like:
```Bash
Name:                hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
Namespace:           default
Status:              Succeeded
Created:             Tue Sep 15 17:42:00 +0000 (1 minute ago)
Started:             Tue Sep 15 17:42:00 +0000 (1 minute ago)
Finished:            Tue Sep 15 17:42:10 +0000 (1 minute ago)
Duration:            10 seconds
Parameters:          
  s3-bucket:         quantum-engine
  s3-key:            projects/v1

STEP                                                          PODNAME                                                         DURATION  MESSAGE
  hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1 (qeDagWorkflow)                                                                                     
 ├- greeting (greeting)                                                hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381  9s        welcome  
```

This output shows the status of the execution of the steps in your workflow. As you can see in this example, we just have the one step `greeting` which ran for 9 seconds and has already completed.

**2. Workflow Results**

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

**3. Downloading the Results**

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
            "message": "Welcome to Orquestra!", # The message generated by this step
            "schema": "message",
            "taskClass": "greeting",
            "taskId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381",
            "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
        },
        "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
    }
}
```

The section `hello-workflow-36779dcb- ... -3219967381` corresponds to the step that was run by your workflow. Note that this ID matches that in the output of `qe get workflow`. This section contains information about the step that was executed, any input parameters or input artifacts, and the output artifacts. More information on the contents of this file are found on the [workflow results via JSON page](../../data-management/workflow-result/).

## Summary

We have now seen how to construct a working workflow from an existing component, importing the component and using code from it.

Additionally, we submitted a workflow to Quantum Engine and got its result in JSON format.
This hopefully illucidated some of the key concepts and mechanics in using Orquestra Quantum Engine.

## Completed Tutorial Materials

For your convenience, here are the completed components and workflow:

[Welcome component](https://github.com/zapatacomputing/tutorial-0-welcome)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/workflow-v1/hello-workflow.zqwl)

Note that this workflow has another step after the first `greeting` step. That step is added in the next tutorial, [Hello Component](../hello-component)

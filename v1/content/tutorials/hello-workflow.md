---
title: "Hello Workflow"
summary: Start here to learn how to build workflows with Orquestra.
weight: 1
---

This tutorial will guide you through the process of building a simple Orquestra workflow. By the end of this tutorial you will have written an Orquestra workflow that prints "Welcome to Orquestra!". To do this, you will:

* Import an Orquestra `component` into a workflow
* Invoke the `component` from within a `step` in the workflow `steps`
* Submit the workflow into to the Quantum Engine for processing
* Retrieve the workflow results

## Prepare your environment

* Install the [Quantum Engine CLI](../../qe-cli/install-cli/)
* Install a text editor ([VSCode](https://code.visualstudio.com/), [Atom](https://atom.io/), etc.) of your choice


## Your First Workflow

An Orquestra workflow consists of 4 fields:

  1. **`apiVersion`**: the workflow API version `io.orquestra.workflow/1.0.0`
  2. **`name`**: the workflow name. This will be used asa a prefix for your generated workflow ID
  3. **`imports`**: a list of Orquestra Components to be pulled in for this workflow. Orquestra Components are imported into the workflow so that they can be invoked by `steps`. This minimizes the amount of code duplication and allows you to incorporate existing code libraries. For the purposes of this tutorial we will be using an Orquestra Component. You can learn how to build a custom Orquestra Component in the [Hello Component Tutorial](../hello-component/)
  4. **`steps`**: a list of Orquestra `steps` that will be executed. A `step` can invoke a `component` in the context of a specified `runtime` using a desired set of `resources`. 

For custom `types` we will always include a `types` field.

## Building the Workflow

Let's get started by opening up a text editor and creating an empty text file called `welcome-workflow.yaml`. This `yaml` file will contain the workflow definition for our Orquestra workflow. Go ahead and copy and paste the following code into your editor:

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
```

In this snippet, we specified the `apiVersion`, the `name` of the workflow, and list of components to bring in under `import`.

`import` has a single entry that brings in the `tutorial-0-welcome` component from GitHub. `tutorial-0-welcome` is a simple component that runs a Python script that prints "Welcome to Orquestra!". You can find the source code for this component [here](https://github.com/zapatacomputing/tutorial-0-welcome).

Next, we'll invoke the `welcome-to-orquestra` component in by creating a step entry under the `steps` field. We can do this by inserting the following code snippet below the the `welcome-to-orquestra` component in your `welcome-workflow.yaml`:

```YAML
steps:

# This step runs the `welcome` function in the `welcome-to-orquestra` component
- name: greeting
  config:
    runtime:
      language: python3
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

The final step is just to include a `types` field to the end of the workflow. In the `greeting` step we declared the `output` to be of `type: message`, therefore we'll declare the message type by adding following snippet to the end of this workflow:

```YAML
types:
- message
```

You can also refer to the [workflow basics page](../../quantum-engine/workflow-basics/) for a more in-depth explanation of each of the fields in the sample workflow above. 

The workflow is now complete and we are now ready to submit it to the Quantum Engine for execution. 


### Running the Workflow

To run the workflow and get our results back we'll need to:
* Login to the `qe` CLI
* Submit the workflow to the Quantum Engine
* Wait for the Quantum Engine to process the workflow and execute the `steps`
* Retrieve the results using the `qe CLI

#### Logging in to the QE CLI

Please make sure you have the Quantum Engine CLI installed and configured for your operating system. You can find the instructions for installing the CLI [here](../../qe-cli/install-cli/).

Open your terminal and login to Quantum Engine using CLI by running the following command `qe login -e <your-email> -s <quantum-engine-uri>`

You may need to contact your Orquestra support representitive for your account details and the  `quantum-engine-uri`.

#### Submit the Workflow

From your terminal, `welcome-workflow.yaml` can be submitted to the Quantum Engine by running `qe submit workflow <path/to/workflow/welcome-workflow.yaml>`

The qe CLI should respond with the workflow ID that corresponds to that particular execution of your workflow:

```Bash
Successfully submitted workflow to quantum engine!
Workflow ID: hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
```

#### Workflow Progress

The workflow is now submitted to the Quantum Engine and will be scheduled for execution when compute becomes available.

You can run `qe get workflow <workflow-ID>` using the workflow ID from the output of the submit step to check in on the progress of the workflow. In our case the workflow-ID was `hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1`:

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

#### Workflow Results

Once a workflow has completed you can retrieve its results by running `qe get workflowresult <workflow-ID>` with your workflow ID.

Even after it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:
```Bash
Name:        hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1
Location:    http://a49397a7334b711ea99a80ac353ea38d-1340393531.us-east-1.elb.amazonaws.com:9000/workflow-results/hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200915%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200915T193213Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1.json%22&X-Amz-Signature=3366f8eb8b0701d1bce40c329f6a3a42a1c73f603d93b7ced22b99e181a6a67d
```
___
**Note:** The above `Location:` link is only valid for a brief period and typically expires after 7 days.
___

#### Downloading the Results

When your workflow is completed, the `workflowresult` command will provide you with a http web-link under the `Location` field in the console output. Click on or copy and paste the link into your browser to download the file.

This file will look like the following (except for the comments, which were added in this tutorial for clarity):

```JSON
{
    "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381": { # The ID of the step that executed the `greeting` step
        "class": "greeting",
        "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381",
        "inputParam:docker-image": "z-quantum-default",
        "inputParam:docker-registry": "zapatacomputing",
        "inputParam:docker-tag": "latest",
        "welcome": { # An artifact called `welcome`
            "id": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381/welcome",
            "message": "Welcome to Orquestra!", # The message generated by this step
            "schema": "message",
            "stepName": "greeting",
            "stepId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1-3219967381",
            "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
        },
        "workflowId": "hello-workflow-36779dcb-d0af-4802-9462-41a41e254fa1"
    }
}
```

The section `hello-workflow-36779dcb- ... -3219967381` corresponds to the step that was run by your workflow. Note that this ID matches that in the output of `qe get workflow`. This section contains information about the step that was executed, any input parameters or input artifacts, and the output artifacts. More information on the contents of this file are found on the [workflow results via JSON page](../../data-management/workflow-result/).

## Completed Tutorial Materials

For your convenience, you can find the completed workflow and components used in this tutorial on GitHub:

[Welcome component](https://github.com/zapatacomputing/tutorial-0-welcome)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.yaml)

Note that this workflow has another step after the first `greeting` step. That step is added in the next tutorial, [Hello Component](../hello-component/)

---
title: "Hello Component"
summary: Learn how to build workflow components with Orquestra.
weight: 2
---

This tutorial will help you build Orquestra Components, the unit of re-useable code for Orquestra workflows.  By the end of this tutorial you will have written an Orquestra Component that contains a Python script for printing “Welcome to Orquestra!”. To do this, you will:

* Create an empty GitHub repository with the project structure for an Orquestra Component
* Create a `welcome.py` file as a way to demonstrate how to package code in a re-useable way
* Publish the component and test in a workflow


## Prepare your environment

* Install the tools required for using Git and GitHub. You can find some documentation for this on [GitHub's documentation](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/installing-and-authenticating-to-github-desktop)
* Install a text editor ([VSCode](https://code.visualstudio.com/), [Atom](https://atom.io/), etc.) of your choice
* Python 3.7+ 

## Building a Component

### Create a GitHub Repository

Go to [GitHub](https://github.com/) and create a public repository called `welcome-component`. If you are unfamiliar with GitHub you can reference GitHub's [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

The `welcome-component` repository will be where code called by a workflow lives. [This GitHub repo](https://github.com/zapatacomputing/tutorial-0-welcome) can be used as a reference for how `welcome-component` should look like throughout the tutorial.

### Adding Some Code

Orquestra currently supports Python3 source code. There are different ways to organize a component. In this example, we will put the python script at the root of the component. You can find more information about Components on the [Components page](../../quantum-engine/components/), and you can find more information about how to make your component compatible with the Python3 runtime on the [Runtime page](../../quantum-engine/runtime/).

At the root of your github repo, create a Python script called `welcome.py`. Orquestra does support other file structures in components, but the workflow included in this tutorial expects this script to be at the root.

Open `welcome.py` in an editor and add the following snippet:

```Python
"""
This function saves a welcome message.
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

`welcome.py` creates a `message_dict` object with an entry for "Welcome to Orquestra!" and writes it as an artifact to `welcome.json`. 

Its important to note that all artifacts must have a `schema` field. More details on artifacts are found on the [artifacts page](../../data-management/workflow-artifacts/).

We create the file `welcome.json` because any output has to be saved in a file in order to be passed on to the next step or to be accessible for data analysis after the workflow has completed. We will see how to pass it on to another step later in this tutorial.

### Publish your Component

The `welcome-component` is now complete and ready to be used in a workflow. 

Once you are satisfied with your work, commit your changes and push them to GitHub.

### Building a Workflow

The component is now ready to be used in an Orquestra workflow. Create a local `.yaml` file with a name of your choosing. Paste in the workflow below, and replace `<your-github-username>` and `<your-repo-name>` with the details of the repo you just created. Please refer to the [Hello Workflow](../hello-workflow/) tutorial for an introduction to running a workflow.

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
    repository: "git@github.com:<your-github-username>/<your-repo-name>.git"
    branch: "master"

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
  outputs:
  - name: welcome
    type: message

types:
- message
```

## Completed Tutorial Materials

For your convenience, you can find the completed workflow and components used in this tutorial on GitHub:

[Welcome component](https://github.com/zapatacomputing/tutorial-0-welcome)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.yaml)

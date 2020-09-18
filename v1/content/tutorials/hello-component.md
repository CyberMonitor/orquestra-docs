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

### Create a GitHub Repositry

Go to [GitHub](https://github.com/) and create a public repository called `welcome-component`. If you are unfamiliar with GitHub you can reference GitHub's [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

The `welcome-component` repository will be where th. [This GitHub repo](https://github.com/zapatacomputing/tutorial-0-welcome) can be used as a reference for how `welcome-component` should look like throughout the tutorial.

### Creating the Component Folder Structure

While there are no restrictions on how to organize an Orquestra Component, we recommend the following folder structure:

```
.
└── src
    ├── python
    │   └── orquestra
    │       └── .
    └── setup.py
```


* The `src/` will contain:
  * A `setup.py` file that is responsible for installing your code in the machine where your workflow is executed. This installation is done automatically for you conforming to [Python3 setuptools standard](https://docs.python.org/3/distutils/setupscript.html) for Setup Scripts.
  * A folder name `python/` containing the source code to be invoked by a `step` in a workflow

Using your terminal or the text editor of your choice, recreate this folder structure in the `welcome-component` repository.

**Note** You can find more informationa bout the structure of a Component on the [Components page](../../quantum-engine/components).

### Adding Some Code

Orquestra can support any Python3 source that is installable via `pip` using a `setup.py` script.

Moving into `src/python/orquestra/` create a Python script called `welcome.py`. Your repo structure should now look like this:

```
.
└── src
    ├── python
    │   └── orquestra
    │       └── welcome.py
    └── setup.py
```

Open `welcome.py` in an editor and add the following snippet:

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

`welcome.py` creates a `message_dict` object with an entry for "Welcome to Orquestra!" and writes it as an artifact to `welcome.json`. 

Its important to note that all artifacts must have a `schema` field. More details on artifacts are found on the [artifacts page](../../data-management/workflow-artifacts/).

We create the file `welcome.json` because any output has to be saved in a file in order to be passed on to the next step or to be accessible for data analysis after the workflow has completed. We will see how to pass it on to another step later in this tutorial.

### Initializing the Component as a Python Package

Now that we've added some code, we need to make this act like a Python Package. Create a file `src/python/orquestra/__init__.py` with the following code snippet:

```Python
from .welcome import *
```
Your folder should now look something like this:

```
.
└── src
    ├── python
    │   └── orquestra
    │       └── __init__.py
    |       └── welcome.py
    └── setup.py
```

### Adding a Setup script

The Component will need a `setup.py` file that lets Orquestra know how to install the `welcome.py` package. Create a new file `src/setup.py` with the following code snippet:

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

- `name` is the given name of your package which you can reference in your template
- `packages` tells the installer to look for a subdirectory called `python`
which contains your source code
- `package_dir` allows the contents of the `python` directory to be imported
without the python path prefix, for example, with `from orquestra import all`

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

For more information regarding how to make your source code available as a `package`, please refer to the [setuptools documentation](https://setuptools.readthedocs.io/en/latest/setuptools.html#developer-s-guide).

### Publish your Component

The `welcome-component` is now complete and ready to be used in a workflow. 

Once you are satisified with your work, commit your changes and push them to GitHub

### Building a Workflow

The component is now ready to be used in an Orquestra workflow. Please refer to the [Hello Worfklow](../hello-workflow) tutorial for an example of invoking a component from within a step.

## Completed Tutorial Materials

For your convenience, you can find the completed workflow and components used in this tutorial on GitHub:

[Welcome component](https://github.com/zapatacomputing/tutorial-0-welcome)

[ZTransform component](https://github.com/zapatacomputing/tutorial-0-ztransform)

[Complete workflow](https://github.com/zapatacomputing/tutorial-0-welcome/blob/master/hello-workflow.yaml)

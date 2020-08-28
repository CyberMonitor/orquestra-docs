---
title: Resources
summary: Resources are one of the key building blocks of an Orquestra workflow and allow you to resuse common components and integrations.
weight: 2
---

## Overview

Resources are the building blocks for your workflows. They define what tasks you are able to perform and what data you will produce.

By incorporating source code into a _resource_, it becomes easily usable and shareable within Orquestra. Through the use of _resources_, we hope to make it as easy as possible to navigate the minefield of bringing your own source code into harmony with others'.

## What is a resource?

You can think of resources as the "libraries" available in your workflow. A resource is made of the **source code** that will be executed at the runtime of a step inside an Orquestra workflow - this can contain one or more functions that take in input parameters and data and produce output data.

### Source Code

The *source code* for a resource is exactly that: it contains all the code to run the process you want. This code will typically be a set of functions that take in inputs and then produce output objects that can be serialized into [artifact(s)](../../data-management/workflow-artifacts/).

###### Note: Currently, new resources must use Python 3.7 source code to be natively supported in Orquestra, however we will be expanding this support to other languages in the future.

## How do I build my own resource?

### Structure

To be used by Orquestra, resources must contain a `src/` folder, containing your source code

An example of the full structure of a resource is below:

```bash
.
├─ README.md
└─ src
   ├── README.md
   ├── python
   │   └── orquestra
   │       ├── __init__.py
   │       └── welcome.py
   └── setup.py
```

### Source Code Installation

# TODO: Update this to v1 standards
Orquestra provides automatic installation of your source code. By configuring your resource with the structure outlined above, you will be able to reference your source code (marked by `welcome.py` in the above example) easily from within your template. The source code can be any valid python code.

#### Setup File

The setup file must be called `setup.py`. It is responsible for installing your code before being called by the template.

An example is shown below:

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


#### Initialization File

The initialization file must be called `__init__.py`. An example is shown below:

```Python
from .welcome import welcome
```

Only the functions that are imported in this file will be accessible when using your source code as a package. Here you will want to import any functions that you need to call from the script in your workflow.

### Referencing a Resource in a Workflow

For a detailed explanataion of how to reference a resource from within a workflow, please refer to the "Resources" section in [Workflow Basics](../../quantum-engine/workflow-basics).
To see an example of a resource, check out Zapata's [Open Pack Core resource](https://github.com/zapatacomputing/open-pack-core) on GitHub.

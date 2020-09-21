---
title: Components
summary: Components are one of the key building blocks of an Orquestra workflow and allow you to resuse common components and integrations.
weight: 3
---

## Overview

Components are reusable pieces of code that can be imported into your workflows. Compononts can accept data as inputs, execute code and produce and produce data as outputs.

Once built, components can be imported into a workflow can be invoked within `steps`. This makes components an easily re-usable and shareable block of code across multiple workflows and experiments.

## What is a Component?

You can think of components as the "libraries" available in your workflow. A component is made of the **source code** that will be executed at the `runtime` of a step inside an Orquestra workflow. A component can contain one or more functions that take in input parameters and data and produce output data.

### Source Code

The *source code* for a component is exactly that: it contains all the code to run the process you want. This code will typically be a set of functions that take in inputs and then produce output objects that can be serialized into [artifact(s)](../../data-management/workflow-artifacts/).

Supported Languages:
* Python 3.x

Orquestra currently has limited support for component languages. However we will be expanding this support to other languages in the future.

## Building Python Components

### Structure

While there are no restrictions on how to organize an Orquestra Component, we recommend the following folder structure:

```bash
.
├─ README.md
└─ src
   ├── python
   │   └── orquestra
   │       ├── __init__.py
   │       └── welcome.py
   └── setup.py
```

### Source Code Installation

Orquestra provides automatic installation of your source code. By configuring your component with the structure outlined above, you will be able to reference your source code (marked by `welcome.py` in the above example) easily from within your template. The source code can be any valid python code.

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

Python3 components must be initialized as a package. This can simply be done through the inclusion of a `__init__.py` file. An example is shown below:

```Python
from .welcome import welcome
```

Only the functions that are imported in this file will be accessible when using your source code as a package. Here you will want to import any functions that you need to call from the script in your workflow.

### Referencing a Component in a Workflow

For a detailed explanataion of how to reference a component from within a workflow, please refer to the "Components" section in [Workflow Basics](../../quantum-engine/workflow-basics).
To see an example of a component, check out Zapata's [z-quantum-core component](https://github.com/zapatacomputing/z-quantum-core) on GitHub.

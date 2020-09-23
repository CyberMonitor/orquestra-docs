---
title: Runtime
summary: Runtimes provide a framework to ensure the environment where a step runs is consistent
weight: 3
---

### Overview

Runtimes provide a lifecycle framework for steps in a workflow. Runtimes typically:
- ensure all orquestra components are available in the step context
- aid in type checking all inputs to the step
- deserialize input data
- ensure the step has all dependencies required to run successfully
- run the step
- serialize output data

### Using Runtimes

When requesting a step to run as part of a workflow, Orquestra provides the connection between the underlying infrastructure and your step through the use of the runtime. How to use a runtime in a workflow step can be found [here](../steps/#runtime) 

Each runtime must specify a `language`. This language determines what software language is utilized during a step of the workflow.

### Where do Runtime Languages come from?

Orquestra comes with a "core" runtime language type to cover the common use case `python3`. This runtime is open source and can be found [here](https://github.com/zapatacomputing/python3-runtime).

Other runtime languages can be community developed, deployed and then used within your runtime as well.

### How do Runtime Languages work?

Each runtime language must contain the following three binaries:

`install` determines and sets up what is required to support this runtime language.
`supply` provides all dependencies for this step.
`run` ensure all types of inputs are correct types, calls the required functions or commands (with correct inputs) to run the step.

### Python3 Runtime Language

Supported Python Versions:
* Python 3.7

While there are no restrictions on how to organize an Orquestra Component, we 

### Source Code Installation

Orquestra provides automatic installation of your source code. By configuring your component with either a 





----


you will be able to reference your source code (marked by `welcome.py` in the above example) easily from within your template. The source code can be any valid python code.

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


 
---
title: Resources
description: The workflow engine of the Orquestra platform
---

## Overview

Resources are a way of making templates and code reusable and shareable. A resource is made of two components: the code that will be executed and the template that calls that code.

Currently, only Python 3.7 code is supported.

## Structure

To be used by Orquestra, resources must contain two folders:
- The `src` folder will contain:
  - A setup file that is responsible for installing code in the machine where a workflow is executed. This installation is done automatically.
  - Source code under a folder called `python` (this is because only Python is supported at this time).
- The `templates` folder contains templates that use the code in the `src` folder.

This is the structure of a simple example resource:

<pre>
.
├── README.md
├── <font color="green"><b>src</b></font>
│   ├── README.md
│   ├── <font color="green"><b>python</b></font>
│   │   └── <font color="green"><b>orquestra</b></font>
│   │       ├── __init__.py
│   │       └── hello.py
│   └── setup.py
└── <font color="green"><b>templates</b></font>
    └── hello.yaml
</pre>

### Source Code

The source code, which is `hello.py` in the above example, can be any valid python code.

### Initialization File

The initialization file must be called `__init__.py`. An example is shown below:

```Python
from .orquestra import *
```

The package name is `orquestra`, as that is name of the folder with the source code.

### Setup File

The setup file must be called `setup.py`. An example is shown below:

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

In this sample, `name` is the name of your package. The contents of the `packages` field in this sample tells the installer to look in your repo in a folder called `python` for your package. The contents of the `package_dir` field in this sample means that the contents of the "python" folder can be imported without the python path prefix, for example, with `from orquestra import all`.

### Template

Your template is responsible for invoking your Python source. A template that will call the Python source code we just wrote is below:

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

Let us proceed to explain the different parts of the template we just created above.

- The `spec` section: every template YAML file must begin with a `spec`, without which your template won't compile.

- The `templates` section under `spec` allows you to list all your templates under it.

- The `name` field tells the compiler the name of your template. This field is required.

- The `parent` field allows us to specify a template natively provided by the Quantum Engine as this `parent` (called `generic-task`) contains the necessary instructions as to how to execute your Python code. This is only needed because our template doesn't have a `steps` section that would have invoked other templates (we will see an example below where a `parent` field is not specified). We finally note that you cannot have multiple parents.

- The `inputs` field lists the different input data that are needed to run your template. We have two sorts of inputs: input parameters and input artifacts. Input artifacts are in general persistent (meaning they will be written to disk) which input parameters are not. In our case, we define an input artifact which is actually executable Python code that calls the Python function we wrote earlier. The aspect to pay attention to is the `command` input parameter: without it, the input artifact will never be executed. This is because `generic-task` will look for the `command` input parameter to determine if there are commands to execute. The compiler will see the `main-script` input artifact and will create to disk a file called `/app/main.py`. But `/app` is the default working directory, so in our command, we only need to specify `python3 main.py` as the value of the `command` input parameter and not `python3 /app/main.py`. And that's how you execute your own Python code using the Quantum Engine.

- The `outputs` field allows us to specify the data we expect at the end of the template's execution. Our Python script in input artfacts produced a file under `/app/welcome.json` but without output artifacts, we will have to look for the file by path all the time, and it could even be garbage collected since we never marked it as an output artifact. By specifying the file as an output artifact, we can refer to it as input artifacts in other templates.

To see an example of a resource, peruse Zapata's [Open Pack Core resource](https://github.com/zapatacomputing/open-pack-core) on GitHub.

## Summary


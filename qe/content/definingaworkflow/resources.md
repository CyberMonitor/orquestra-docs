---
title: Resources
description: The workflow engine of the Orquestra platform
---

## Overview

_Resources_ are the building blocks for your workflows. They define what tasks 
you are able to perform and what data you will produce.

By incorporating source code into a _resource_, it becomes easily usable and 
shareable within Orquestra. Through the use of _resources_, we hope to make it 
as easy as possible to navigate the minefield of bringing your own source code 
into harmony with others'.  


## What is a resource? 

Before diving in to building a resource from scratch, let's first talk about 
why we use _resources_. Above, we said that resources make source code 
"easily usable and shareable within Orquestra", but what does this actually 
mean?

Resources allow us to make our source code accessible in Orquestra - you can 
think about them as the "libraries" available in your workflow. A resource is 
made of two components: 

1. The **source code** that will be executed at runtime - think of this as a 
function, taking in input parameters and data and producing output data
2. The **template** that you can access in your workflow - it wraps your function 
making it "callable" from within your workflow

### Source Code

The *source code* for a resource is exactly that, it contains all the code to
run the process you want. This code will typically be a set of functions that 
take in inputs and then produce output objects that can be serialized into 
[Artifact(s)](https://www.orquestra.io/docs/dcs/data/artifacts/). 

###### Note: Currently, new resources must use Python 3.7 source code to be natively supported in Orquestra, however we will be expanding this support to other languages in the future.

### Templates

*Templates* are the wrappers around your source code that expose it to the 
wonderful world of Orquestra workflows. By taking a function and wrapping it 
into a template, it is able to be referenced in your workflow as a *task*. 

A template definition contains:
1. The optional and necessary inputs, delineating between input parameters and 
input *Artifacts*
2. The expected output *Artifacts*
3. A short script that will call your source code


## How do I build my own resource?

### Structure

To be used by Orquestra, resources must contain two folders:
- A `src` folder, containing your source code
- A `templates` folder, containing the template definitions that can be called
from within your workflow

### Source Code Installation

Orquestra provides automatic installation of your source code. By configuring 
your resource with the structure outlined below, you will be able to reference
your source code (marked by welcome.py in the example) easily from within your
template.

<pre>
.
├── README.md
├── <font color="green"><b>src</b></font>
│   ├── README.md
│   ├── <font color="green"><b>python</b></font>
│   │   └── <font color="green"><b>orquestra</b></font>
│   │       ├── __init__.py
│   │       └── welcome.py
│   └── setup.py
└── <font color="green"><b>templates</b></font>
    └── hello.yaml
</pre>

The source code, which is `welcome.py` in the above example, can be any valid 
python code.

#### Setup File

The setup file must be called `setup.py`. It is responsible for installing your 
code before being called by the template.

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

For more information regarding how to make you source code available as a 
`package`, please refer to the 
[setuptools documentation](https://setuptools.readthedocs.io/en/latest/setuptools.html#developer-s-guide).


#### Initialization File

The initialization file must be called `__init__.py`. An example is shown below:

```Python
from .welcome import welcome
```

In this file, only the functions that are imported will be the ones accesible 
when importing your source code as it's own package. Here you will want to
import any functions that you need to call from your template script.

### Templates

As mentioned above, your template is responsible for wrapping your source code
into a callable object that can be referenced from within your workflow. 
Typically, there will be a one-to-one correspondence between the templates that 
you write and the functions from your source code that you want to expose to 
Orquestra.

All templates are expected to be in various files under the `templates` 
directory and must have the `.yaml` file extension. For these templates to be 
compiled, the file must begin with the `spec` and `templates` headers, with your 
list of templates defined below. 

The fields that define a template are:
 - `name`: This is the name of the template, which is used to reference it in the workflow
 - `parent`: This field is used for templates that reference source code and not a list of other templates. When used, the value of this field must be `generic-task`
 - `inputs`: The `inputs` field lists the different input data that are needed to run your template. We have two sorts of inputs: input parameters and input artifacts. Input artifacts are in general persistent (meaning they will be written to disk) which input parameters are not. In our case, we define an input artifact which is actually executable Python code that calls our source code.
 - - `main-script` (`inputs/artifacts`): For templates referencing source code, the `main-script` input artifact is the script that calls your source code. 
 - - `command` (`inputs/parameters`): For templates referencing source code, the `command` input parameter is the bash command used to launch the script that calls your source code. This value is typically `python3 main.py`
 - `outputs`: This field defines the output `artifacts` that the task produces. By specifying files produced by your source code as an output artifacts, they will be processed by Orquestra and can be refered to as input artifacts in other templates. Anything produced by your source code that is not declared as an ourput artifact will be lost.

Below is an example of a file containing a template named `welcome-to-orquestra` 
that calls the source code shown above.

```YAML
# Every template YAML file must begin with a `spec` and `templates`, without which your template won't compile.
spec:
  templates:

  # Definition for the "welcome-to-orquestra" template
  - name: welcome-to-orquestra
    parent: generic-task
    inputs:
      artifacts:
      - name: main-script
        path: /app/main.py  # The `path` value for artifacts is where they are placed and they must be under the `app` directory
        raw:
          data: |
            from orquestra import welcome
            welcome()
      parameters:
      - name: command
        value: python3 main.py
    outputs:
      artifacts:
      - name: welcome
        path: /app/welcome.json
```

To see an example of a resource, check out Zapata's [Open Pack Core resource](https://github.com/zapatacomputing/open-pack-core) on GitHub.

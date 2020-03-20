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
│   │       └── welcome.py
│   └── setup.py
└── <font color="green"><b>templates</b></font>
    └── welcome.yaml
</pre>

The source code, which is `welcome.py` in the above example, can be any valid python code.

The initialization file must be called `__init__.py`. An example is shown below:

```Python

```

[an example of a `setup.py` is shown, and explained]

[an example of a `task.yaml` is shown, and explained]

To see an example of a resource, peruse Zapata's [Open Pack Core resource](https://github.com/zapatacomputing/open-pack-core) on GitHub.
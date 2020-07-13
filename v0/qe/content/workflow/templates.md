---
title: Templates 
description: The reusable units of Orquestra
---

There are two types of templates: **resource templates** and **workflow templates**.

## Resource Templates

Resource templates are responsible for wrapping your source code into callable objects that can be referenced from within your workflow. Typically, there will be a one-to-one correspondence between the templates that you write and the functions from your source code that you want to expose to Orquestra. 

The fields that define a resource template are:
 - `name`: This is the name of the template, which is used to reference it in the workflow
 - `parent`: This field is used for resource templates and the value of this field must be `generic-task`
 - `inputs`: The `inputs` field lists the different input data that are needed to run your template. We have two sorts of inputs: *input parameters* and *input artifacts*. 
   - *Input parameters* are typically simple values (e.g. strings, integers, floats, etc) that we can configure easily in our workflow.
      - `command` (`inputs/parameters`): For resource templates, the `command` input parameter is the bash command used to launch the script that calls your source code. This value is typically `python3 main.py` and is **required**.
   - *Input artifacts* are in general persistent (meaning they will be written to disk) data (which input parameters are not).
      - `main-script` (`inputs/artifacts`): For resource templates, the `main-script` input artifact is an executable script that calls your source code. This artifact - or an equivalent one - is required so that the `command` references an actual script.
 - `outputs`: This field defines the output `artifacts` that the task produces. By specifying files produced by your source code as an output artifacts, they will be processed by Orquestra and can be refered to as input artifacts in other templates. Anything produced by your source code that is not declared as an ourput artifact will be lost.

Below is an example of a file containing a template named `welcome-to-orquestra` that calls the source code shown on the [Resources page](https://orquestra.io/docs/qe/definingaworkflow/resources).

```YAML
# Every template YAML file must begin with a `spec` and `templates`, without which your template won't compile.
spec:
  templates:

  # Definition for the "welcome-to-orquestra" template
  - name: welcome-to-orquestra
    parent: generic-task
    inputs:
      parameters:
      - name: command
        value: python3 main.py
      artifacts:
      - name: main-script
        path: /app/main.py  # The `path` value for artifacts is where they are placed and they must be under the `app` directory
        raw:
          data: |
            from orquestra import welcome
            welcome()
    outputs:
      artifacts:
      - name: welcome
        path: /app/welcome.json
```

## Workflow Templates

Workflow templates define a series of steps to execute by calling other templates.

Workflow `templates` contain four sections:
- `name`: the name of the template (used to call the template)
- `inputs`: a declaration of expected `parameters` and `artifacts` needed when calling this template
- `outputs`: a declaration of expected `artifacts` produced by calling this template
- `steps`: a series of calls to other `templates` (either *resource templates* or more *workflow templates*)

Workflow templates do not need to declare `inputs` or `outputs`, however, it should be noted that without `inputs`, the steps **within** the template will only have access to artifacts created by previous steps **within the template** and workflow parameters, while when using a template without `outputs`, any steps **calling** this template will not have access to any artifacts produced inside the template.

The basic outline for a workflow template is as follows:
```YAML
  - name: # template name
    inputs:
      parameters:
      # input parameter declarations
      artifacts:
      # input artifact declarations
    outputs:
      artifacts:
      # input artifact declarations
    steps:
      # A list of steps
      # to execute, either 
      # in parallel or
      # in sequence with each other
```

Every workflow must contain **at least** one `template`, the "entrypoint" template. This is where the Quantum Engine begins the execution of your workflow. 

As seen in the [Simulating H₂ with VQE](https://www.orquestra.io/docs/tutorial/hydrogen-vqe/) tutorial, more complex workflows will often consist of workflow templates calling other workflow templates. This allows for the expression of more complex workflows, even including recursion! 

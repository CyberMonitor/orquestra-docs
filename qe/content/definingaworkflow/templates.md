---
title: Templates 
description: blah blah blah
---

There are two types of templates: **workflow templates** and **resource templates**.

## Resource Templates

Resource templates are responsible for wrapping your source code into callable objects that can be referenced from within your workflow. Typically, there will be a one-to-one correspondence between the templates that you write and the functions from your source code that you want to expose to Orquestra. 

The fields that define a resource template are:
 - `name`: This is the name of the template, which is used to reference it in the workflow
 - `parent`: This field is used for templates that reference source code and not a list of other templates. When used, the value of this field must be `generic-task`
 - `inputs`: The `inputs` field lists the different input data that are needed to run your template. We have two sorts of inputs: input parameters and input artifacts. Input artifacts are in general persistent (meaning they will be written to disk) which input parameters are not. In our case, we define an input artifact which is actually executable Python code that calls our source code.
   - `main-script` (`inputs/artifacts`): For templates referencing source code, the `main-script` input artifact is the script that calls your source code. 
   - `command` (`inputs/parameters`): For templates referencing source code, the `command` input parameter is the bash command used to launch the script that calls your source code. This value is typically `python3 main.py`
 - `outputs`: This field defines the output `artifacts` that the task produces. By specifying files produced by your source code as an output artifacts, they will be processed by Orquestra and can be refered to as input artifacts in other templates. Anything produced by your source code that is not declared as an ourput artifact will be lost.

Below is an example of a file containing a template named `welcome-to-orquestra` that calls the source code shown above.

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

## Workflow Templates

Workflow templates define a series of steps to execute by calling other templates.

Workflow `templates` contain three sections:
- `inputs`: a declaration of expected `parameters` and `artifacts` needed when calling this template
- `outputs`: a declaration of expected `artifacts` produced by calling this template
- `steps`: a series of calls to other `templates`  

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

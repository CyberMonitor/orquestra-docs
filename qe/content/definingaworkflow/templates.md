---
title: Templates 
description: blah blah blah
---

The `templates` block is the most important section of a workflow. 
This is where you define the step-by-step instructions of your workflow
for the Quantum Engine to execute. 


---
**Note:**
In this section, we define two new terms: `templates` and `steps`. 
Although similar, there are both semantic and syntactical 
differences between the two. 

- A `template` is the like definition of a function - it defines the inputs, 
outputs, and series of instructions to be performed. 

- In contrast, a `step` is the invocation of a `template`, passing objects and 
parameter values to the `template` to be executed. 

See the Steps section below for a more in-depth description.

---

Workflow `templates` contain three sections:
- `inputs`: a declaration of expected `parameters` and `artifacts` needed when calling this template
- `outputs`: a declaration of expected `artifacts` produced by calling this template
- `steps`: a series of calls to other `templates`  

Workflow templates do not need to declare `inputs` or `outputs`, however, it
should be noted that without `inputs`, the steps **within** the template will only 
have access to artifacts created by previous steps **within the template** and 
workflow parameters, while when using a template without `outputs`, any steps 
**calling** this template will not have access to any artifacts produced inside 
the template

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

---
**Note:**
The difference between workflow templates and resource templates
is that, while [resource](https://orquestra.io/docs/qe/definingaworkflow/resources/) 
templates run source code on a physical machine, workflow templates define 
a series of steps to execute by calling other templates. 
---

Every workflow must contain **at least** one `template`, the "entrypoint" template. 
As specified in the `Entrypoint` section, this is where the Quantum Engine 
begins the execution of your workflow. 

```YAML
# Data for running the workflow
spec:

  # The steps of the workflow
  templates:

  # `salutations` is a template that just contains a list of `steps`, which are other templates
  - name: salutations
    steps:

    # This template runs the `welcome-to-orquestra` template in the `welcome` resource
    - - name: greeting
        template: welcome-to-orquestra
        arguments:
          parameters:
          - resources: [welcome]
```

As seen in the [Simulating H₂ with VQE](https://www.orquestra.io/docs/tutorial/hydrogen-vqe/) 
tutorial, more complex workflows will often consist of workflow templates calling
other workflow templates. This allows for the expression of more complex workflows,
even including recursion! 

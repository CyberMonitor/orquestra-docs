---
title: Steps 
description: The functional unit of a workflow 
---

## Overview

In contrast to a [template](https://www.orquestra.io/docs/qe/workflow/templates) declaration, a step declaration is the invocation of a given template. When defining a step in your workflow, you must pass the required `arguments` declared by the template.

The basic outline of a step is shown below:

```YAML
    # This is a step and would go under the "steps" section of a workflow template
    - - name: # the name of the step
        template: # the name of the template that this step invokes
        arguments:
          parameters:
          # parameter values/references
          - resources: # a required parameter value for all steps
          artifacts:
          # artifact values/references
        withItems: # (if applicable)
```

### Name

The `name` field is typically a human-readable name that can be used to reference a step. 

Step references are important because they allow us to pass artifacts produced by a certain step to the input of another. Since the step name is used to reference a specific step, it must be a unique name. For more information about how to reference the output of a given step, check out the "Referencing Step Outputs" section below.

### Template

The `template` field is the name of the template we want to use for the current step. 

The template used in a step can be either a workflow template or a resource template. This allows for us to be more expressive and create more complex workflows.

### Arguments

The `arguments` section is where we declare the values of input parameters and input artifacts for the chosen template. Both fields are optional depending on whether or not the template requires input parameters and/or artifacts. 

#### Parameters

Parameters are typically simple values (e.g. strings, integers, floats, etc) that we can configure easily in our workflow.

##### The "resources" parameter

The `resources` parameter is a required value when calling any template that is defined outside of the current workflow file or **resource template** that uses external source code. It is used to both tell our workflow compiler where your template exists, as well as to install the necessary resources that you would like to be accessible in your step at runtime.

For example, in the [Simulating H₂ with VQE](https://orquestra.io/docs/tutorial/hydrogen-vqe/) tutorial, the `create-molecule` step references both the `diatomic-molecule` resource and the `open-pack-core` resource. The `diatomic-molecule` resource contains the template definition as well as source code, however, it also references source code in `open-pack-core`, so we have to declare it as a resource as well.

#### Artifacts

Artifacts are the more complex data structures used by Orquestra. Check out our section on [Artifacts](https://www.orquestra.io/docs/dcs/data/artifacts/) for more information about them from a data management perspective. 

In this section of a step, we must declare the specific artifacts that we want to use in the current step. It is currently only possible to use artifacts produced by the execution of the current workflow. These must be referenced by name. 

See the following two sections ("Referencing Step Outputs" and "Referencing Template Inputs") to see the different ways to reference the values for artifacts.

##  Additional Functionality 

### Referencing Step Outputs

In workflows, it is often the case that we want to pass the output artifact of one step as the input into the next. This allows us to perform more complex operations on our data while also maintaining the maximum amount of data for data analysis.

In the example below, we have a template consisting of two steps. `step1` produces an output artifact called `artifact1` which is then used as the input to `step2`.

```YAML

  - name: example-template
    steps:
    - - name: step1
        template: template1
        arguments:
          parameters:
          - resources: [template1-resource]
    - - name: step2
        template: template2
        arguments:
          parameters:
          - resources: [template2-resource]
          artifacts:
          - input-artifact:
                from: "{{steps.step1.outputs.artifacts.artifact1}}"
```

As shown above, we use the syntax: `"{{steps.<step name>.outputs.artifacts.<artifact name>}}"` to reference the output artifact of a certain step. 

### Referencing Template Inputs

In addition to referencing artifacts produced by other steps, sometimes we want to pass an artifact to a workflow template and then use it in one or more of that templates steps. 

In the example below, we have a template that declares an input artifact called `template-input-artifact`. Then, `step1` and `step2` both use that input artifact as an input to the templates they each call.  

```YAML
  - name: example-template
    inputs:
        artifacts:
        - name: template-input-artifact
    steps:
    - - name: step1
        template: template1
        arguments:
          parameters:
          - resources: [template1-resource]
          artifacts:
                from: "{{inputs.artifacts.template-input-artifact}}"
    - - name: step2
        template: template2
        arguments:
          parameters:
          - resources: [template2-resource]
          artifacts:
          - input-artifact:
                from: "{{inputs.artifacts.template-input-artifact}}"
```

As shown above, we use the syntax: `"{{inputs.artifacts.<artifact name>}}"` to reference the input artifact of the current template. 

### Looping Over Steps

In Orquestra's workflow language we have the ability to perform a loop over a certain step, optionally passing different inputs during each iteration. 

To perform a loop, we add the `withItems` attribute to the step we want to loop over. It should be noted that there are two equivalent ways to define the `withItems` attribute. Both are shown below.

Option 1
```YAML
  - name: example-loop
    steps:
    - - name: step-to-loop-over
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
        withItems: [1, 2, 3, 4]
```

Option 2
```YAML
  - name: example-loop
    steps:
    - - name: step-to-loop-over
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
        withItems:
        - 1
        - 2
        - 3
        - 4
```

We can also reference the value of the "item" of the current iteration in our step. The syntax for this is shown below where we set the value of the `name` to the value of the "item" for the current iteration.  

```YAML
  - name: example-loop
    steps:
    - - name: step-to-loop-over
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
          - name: "{{item}}"
        withItems: ["Bob", "Alice"]
```

___
**Note:** All loops are performed in parallel by default
___

### Serial Steps vs Parallel Steps

In Orquestra, we also have the capability to control which steps in a template are performed in parallel and which are performed serially. By having this control, we enable workflows to take advantage of the distributed nature of Orquestra - allowing you to get your results quicker. To show how to control your step scheduling, let's take a look at some examples.

#### Example 1: Serial Scheduling

To ensure that steps are performed serially, you must ensure that each step has two `-`'s before the name field.

```YAML
  - name: serial-example
    steps:
    - - name: step-1
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
    - - name: step-2
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
```

In the above example, `step-1` and `step-2` both have two `-`'s and therefore `step-2` will not begin to execute until `step-1` has finished.

#### Example 2: Parallel Scheduling

To allow a set of steps to be performed in parallel, the syntax becomes as follows: the first step in the set of parallel steps still needs two `-`'s, however, all other steps in the set should only have one `-`. 

```YAML
  - name: parallel-example
    steps:
    - - name: step-1
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
      - name: step-2
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
      - name: step-3
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
```

In the above example, `step-1`, `step-2`, and `step-3` are all performed in parallel with each other.

#### Example 3: Mixed Scheduling

Often it is the case that we want a step in a template to perform only after all steps in a set of parallel steps have finished. To do this, one just needs to set the step that should wait for all to finish to have two `-`'s. 

```YAML
  - name: mixed-example
    steps:
    - - name: serial-step-1
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
    - - name: parallel-step-1
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
      - name: parallel-step-2
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
      - name: parallel-step-3
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
    - - name: serial-step-2
        template: example-template
        arguments:
          parameters:
          - resources: [example-resource]
```

In the above example, the steps execute in the following order: 
1. `serial-step-1` begins
2. `serial-step-1` finishes
3. `parallel-step-1`, `parallel-step-2`, and `parallel-step-3` all begin executing
4. `parallel-step-1`, `parallel-step-2`, and `parallel-step-3` all finish executing (it is entirely possible for one of these steps to finish before another begins)
5. `serial-step-2` begins
6. `serial-step-2` finishes

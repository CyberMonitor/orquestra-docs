---
title: Steps 
description: The functional unit of a workflow 
---

In contrast to a template declaration, a step declaration is the invocation of a given template. When defining a step in your workflow, you must pass the required `arguments` declared by the template.

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

(Talk about:
- steps being an invocation of a template
- arguments, parameters, artifacts
- resources parameters
- looping
- parallel vs serial
)

The ability of `steps` to be either workflow templates or resource templates allows for template
chaining, creating more complex workflows.
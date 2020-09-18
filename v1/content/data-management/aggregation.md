---
title: Data Aggregation
summary: Transformation of workflow artifacts for further data analysis
weight: 2
---

## Aggregation

Aggregation is one of the two main data management functions of Orquestra.

The function of aggregation is to transform all of the [artifacts](../../data-management/workflow-artifacts/) from one execution of a workflow into a format that is cohesive and suitable for data analysis.

## Format of Aggregation Result

The top level of a workflow result file has [task data objects](../../data-management/workflow-artifacts/). Each task is labeled uniquely by its ID. To retrieve the IDs corresponding to tasks run in a workflow, run

`qe get workflow <workflow ID>`

This will produce an output with task IDs next to the names of tasks:

```Bash
STEP                                                          STEP ID                                                         DURATION  MESSAGE
  hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1 (qeDagWorkflow)
 ├- greeting (greeting)                                                hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836  11s       welcome
 └- transform-welcome (transform-welcome)                              hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-3320375620  9s        zelcome
```

The result of aggregation is a single JSON file, with task data objects at the top level. Each task data object includes information such as:
- `id` - unique task ID
- `workflowId` - originating workflow ID
- `class` - type of the task
- `inputParam:_` - input parameters

Each task data object has one or more [artifacts](../../data-management/workflow-artifacts/) inside of it. These are labeled by the name of the artifact given in the workflow. Each artifact includes information such as:
- `id` - unique artifact ID
- `workflowId` - originating workflow ID
- `schema` - type of the artifact
- `taskClass` - name of the step that produced the artifact
- `taskId` - originating task ID

```JSON
{
  # Step:
  "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836": { # Step ID
    "class": "greeting",
    "id": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836",
    "inputParam:docker-image": "z-quantum-default",
    "inputParam:docker-registry": "zapatacomputing",
    "inputParam:docker-tag": "latest",
    "workflowId": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1"
    # Output artifact from step:
    "welcome": { # Artifact name
      "id": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836/welcome",
      "message": "Welcome to Orquestra!",
      "schema": "message",
      "stepId": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836",
      "stepName": "greeting",
      "taskClass": "greeting",
      "taskId": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1-1576635836",
      "workflowId": "hello-workflow-814ffb7c-5fbb-45df-aedb-4ea76f76b9f1"
    }
  }
}
```

To initiate aggregation, see [Workflow Results via JSON](../../data-management/workflow-result/).

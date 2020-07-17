---
title: Data Aggregation
summary: Transformation of workflow artifacts for further data analysis
weight: 1
---

## Aggregation

Aggregation is one of the two main data management functions of Orquestra.

The function of aggregation is to transform all of the [artifacts](/data/artifacts/) from one execution of a workflow into a format that is cohesive and suitable for data analysis.

## Format of Aggregation Result

The top level of a workflow result file has [task data objects](/data/taskdataobjects/). Each task is labeled uniquely by its ID. To retrieve the IDs corresponding to tasks run in a workflow, run

`qe get workflow <workflow ID> -o visual`

This will produce an output with task IDs next to the names of tasks:
![Task IDs](/img/taskids.png)

The result of aggregation is a single JSON file, with task data objects at the top level. Each task data object includes information such as:
- `id` - unique task ID
- `workflowId` - originating workflow ID
- `class` - type of the task
- `inputParam:_` - input parameters

Each task data object has one or more [artifacts](/data/artifacts/) inside of it. These are labeled by the name of the artifact given in the workflow. Each artifact includes information such as:
- `id` - unique artifact ID
- `workflowId` - originating workflow ID
- `schema` - type of the artifact

![](/img/workflowresult.png)

To initiate aggregation, see [Workflow Results via JSON](/data/json/).
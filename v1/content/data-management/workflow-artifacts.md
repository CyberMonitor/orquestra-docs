---
title: Workflow Artifacts
summary: Input and output of data from steps of a workflow
weight: 3
---
## Artifacts

An **Artifact** is a unit of data that is used or created by a workflow execution. An artifact usually represents an object. For example, an artifact can repesent a molecule or a circuit. It is created by steps in a workflow. Currently, only JSON format is supported for artifacts.

By bundling data into artifacts, outputs of one step in a workflow can be sent as inputs to the other steps that need them.
![Workflow](../../img/artifacts2.png)

Artifacts are also key components of a workflow results file as described on [the aggregation page](../../data-management/aggregation/).


## Step Artifact

A **Step Artifact** is a special type of artifact that contains information about one step that was run by a workflow. It is created by the [correlation](../../data-management/correlation/) process.

Steps are also key components of a workflow results file as described on [the aggregation page](../../data-management/aggregation/).

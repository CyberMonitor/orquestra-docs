---
title: Artifacts
description: The units of data created by workflows.
---

An **Artifact** is a unit of data that is used or created by a workflow execution. An artifact usually represents an object. For example, an artifact can repesent a molecule or a circuit. It is created by tasks in a workflow. Currently, only JSON format is supported for artifacts. It includes information such as:
- `id` - unique ID of the artifact
- `workflowId` - originating workflow ID
- `schema` - type of the artifact

**Example Artifact:**
![Artifact](/../img/artifactsample2.png)

By bundling data into artifacts, this allows the user to send the relevant output of one task in a workflow as input to the other tasks that need it.
![Workflow](/../img/artifacts2.png)

Artifacts are also key components of a workflow results file as described in [this section](/data/json/).
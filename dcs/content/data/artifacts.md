---
title: Artifacts
description: The units of data created by workflows.
---

An **Artifact** is a unit of data that is used or created by a workflow execution. An artifact usually represents an object. For example, an artifact can repesent a molecule or a circuit. It is created by tasks in a workflow. Currently, only JSON format is supported for artifacts.

By bundling data into artifacts, outputs of one task in a workflow can be sent as inputs to the other tasks that need them.
![Workflow](/../img/artifacts2.png)

Artifacts are also key components of a workflow results file as described on [the aggregation page](/data/aggregation/).
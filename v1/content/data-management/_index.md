---
title: 'Data Management Suite'
date: 2018-11-28T15:14:39+10:00
description: Managing data with Orquestra
weight: 1
---

Orquestra has a complete data management lifecycle system for items passed between steps of a workflow.

Workflow executions create two categories of data: artifacts and tasks.
- An [Artifact](data/artifacts/) is a unit of data that is used or created by a workflow execution. For example, an artifact can repesent a molecule or a circuit.
- A [Task Data Object](data/taskdataobjects/) is a unit of data that contains information about one task that was run by a workflow.

Orquestra has two distinct functions that it performs on workflow data: correlation and aggregation.
- The function of [correlation](data/correlation/) is to collect output artifacts from a workflow execution, create task data objects, and persist both the artifacts and task data objects for subsequent processing.
- The function of [aggregation](data/aggregation/) is to transform all of the artifacts from one execution of a workflow into a format that is suitable for data analysis. The format of the output is described in more detail on [the workflow results as JSON page](/data/json/).

![Data management](./img/dataintro4.png)
---
title: Data Management System Overview
summary: Learn about the different components of the Data Management System
weight: 1
---

Orquestra has a complete data management lifecycle system for items passed between steps of a workflow.

Workflow executions create two categories of data: artifacts and steps.
- An [Artifact](../../data-management/workflow-artifacts/) is a unit of data that is used or created by a workflow execution. For example, an artifact can repesent a molecule or a circuit.
- A [Step Data Object](../../data-management/workflow-artifacts/) is a unit of data that contains information about one step that was run by a workflow.

Orquestra has two distinct functions that it performs on workflow data: correlation and aggregation.
- The function of [correlation](../../data-management/correlation/) is to collect output artifacts from a workflow execution, create step data objects, and persist both the artifacts and step data objects for subsequent processing.
- The function of [aggregation](../../data-management/aggregation/) is to transform all of the artifacts from one execution of a workflow into a format that is suitable for data analysis. The format of the output is described in more detail on [the workflow results as JSON page](../../data-management/workflow-result/).

![Data management](../../img/dataintro4.png)

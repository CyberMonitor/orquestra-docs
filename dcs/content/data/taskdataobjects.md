---
title: Task Data Objects
description: The units of data containing information about tasks.
---

A **Task Data Object** is a unit of data that contains information about one task that was run by a workflow. It is created by the [correlation](/data/correlation/) process. It includes information such as:
- `id` - ID corresponding to one instance of running a workflow task
- `workflowId` - originating workflow ID
- `class` - type of the task
- `inputParam:_` - input parameters

Tasks are also key components of a workflow results file as described in [this section](/data/json/).
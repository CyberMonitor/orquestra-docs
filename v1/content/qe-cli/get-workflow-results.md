---
title: Get Workflow Results
summary: Getting the results of your completed workflow
weight: 6
---

To get the results of your workflow execution, please run the following command:

```Bash
qe get workflowresult <workflow ID>
```

The workflow ID is provided when you [submit a workflow](../workflow-submission/).

This will start the process of aggregating your results. Run this command every two minutes until you get a link to download the results.

For more information, see [Workflow Results via JSON](../../data-management/workflow-result/).

___
**Note**: Before you run this command, please make sure you're logged in (see [Logging In](../logging-in)).
___
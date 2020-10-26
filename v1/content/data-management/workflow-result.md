---
title: Workflow Result
summary: View and analyze workflow results in JSON format
weight: 4
---

## Workflow Results via JSON

To initiate an aggregation of a workflow, run:

`qe get workflowresult <workflow ID>`

This starts the aggregation process. To see if the aggregation has finished, run that command again. Aggregation is dependent on the workflow output having been correlated, which occurs automatically when a workflow is finished running. If correlation has not yet finished, aggregation will fail. When aggregation has finished, it will return a download link for the file. An example:
![Download link](../../img/downloadlink2.png)

This link will expire after seven days. If the link expires and you did not get the file, please contact support.

The format of the output is described in more detail on [the aggregation page](../../data-management/aggregation/). For a tutorial on how to make a plot from a workflow result file, see [the H₂ VQE tutorial](../../tutorials/simulate-h2-with-vqe/).
For information about additional tools to support the analysis of workflow results, see  [Supporting Tools](../../other-resources/supporting-tools).

There is also a deprecated method for aggregation. This can be used instead using the command:

`qe get workflowresult <workflow ID> --legacy`
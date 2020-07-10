---
title: Fetching Data
description: How to view and analyze workflow results in JSON format.
---

## Workflow Results via JSON

To initiate an aggregation of a workflow, run

`qe get workflowresult <workflow ID>`

This starts the aggregation process. To see if the aggregation has finished, run that command again. Aggregation is dependent on the workflow output having been correlated, which occurs automatically when a workflow is finished running. If correlation has not yet finished, aggregation will fail. When aggregation has finished, it will return a download link for the file. An example:
![Download link](/../img/downloadlink2.png)

This link will expire after seven days. If the link expires and you did not get the file, please contact support.

The format of the output is described in more detail on [the aggregation page](/data/aggregation/). For a tutorial on how to make a plot from a workflow result file, see [the H₂ VQE tutorial](http://orquestra.io/docs/tutorial/hydrogen-vqe/).
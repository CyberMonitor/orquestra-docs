---
title: Aggregation
description: Transformation of output data for data analysis.
---

Aggregation is one of the main two data management functions of Orquestra.

The function of [aggregation](/data/aggregation/) is to transform all of the artifacts from one execution of a workflow into a format that is suitable for data analysis.

To initiate an aggregation of a workflow, run
`qe get workflowresult <workflow ID>`

This starts the aggregation process. To see if the aggregation has finished, run that command again. When it has finished, it will return a download link for the file. An example:
![Download link](/../img/downloadlink2.png)

This link allows you to download the aggregation with one click. It will expire after seven days. Please use it to download the file within the seven days. If the link expires and you did not get the file, please contact support.

The format of the output is described in more detail in [this section](/data/json/).
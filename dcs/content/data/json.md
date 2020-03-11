---
title: Workflow Results via JSON
description: How to view and analyze workflow results in JSON format.
---

To get a workflow result file in JSON, see [aggregation](/data/aggregation/). To see a full example of a workflow result file, see TODO:link. For a tutorial on how to make a plot from a workflow result file, see TODO:link.

##**Format**

The top level of a workflow result file has [task data objects](/data/taskdataobjects/). Each task is labeled uniquely by its ID.

Each task data object has one or more [artifacts](/data/artifacts/) inside of it. These are labeled by the name of the artifact given in the workflow.

(TODO:annotated screenshot of workflow result)
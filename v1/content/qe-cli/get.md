---
title: QE Get
summary: Information on the `get` command on the QE CLI
weight: 4
---

##### Commands

| Command    | Description |
|------------|-------------|
| [`imports`]({{<ref "#qe-get-imports">}}) |  Downloads imports locally. |
| [`logs`]({{<ref "#qe-get-logs">}}) |  Downloads imports locally. |
| [`workflow`]({{<ref "#qe-get-workflow">}}) |  Downloads imports locally. |
| [`workflowresults`]({{<ref "#qe-get-workflowresults">}}) |  Downloads imports locally. |

##### Flags

| Flags   | Description |
|------------|-------------|
| `-h`, `--help` | help for using get |

___
**Note**: `qe get` commands require you to be logged in (see [Login](../commands#login)).



## qe get imports
Downloads all of the imports present in the provided Orquestra `workflow.yaml` locally

```Bash
qe get imports -f <path to workflow.yaml>
```

## qe get workflow

To get a visual representation of your workflow execution, please run the following command:

```Bash
qe get workflow <workflow ID>
```

The workflow ID is provided when you [submit a workflow](../workflow-submission/).

## qe get workflowresults

To get the results of your workflow execution, please run the following command:

```Bash
qe get workflowresult <workflow ID>
```

The workflow ID is provided when you [submit a workflow](../workflow-submission/).

This will start the process of aggregating your results. Run this command every two minutes until you get a link to download the results.

For more information, see [Workflow Results via JSON](../../data-management/workflow-result/).


## qe get logs

To get logs from your workflow execution, please run the following command:

```Bash
qe get logs <workflow ID> -s <step name>
```

The workflow ID is provided when you [submit a workflow](../workflow-submission/).

The step name can be retrieved by [getting workflow details](../get-workflow-details/).

**Note:** The logs are retrieved from three phases of a workflow step```(init, wait, and main)```. The limit for log count associated with each section is ```10000```.
---
title: QE Submit
summary: Information on the `submit` command on the QE CLI
weight: 3
---

##### Commands

| Command    | Description |
|------------|-------------|
| [`workflow`]({{<ref "#qe-submit-workflow">}}) | Submits a workflow to Orquestra for processing|


##### Flags

| Flags   | Description |
|------------|-------------|
| `-h`, `--help` | help for using submit |

___
**Note**: `qe submit` commands require you to be logged in (see [Logging In](../logging-in)).


## qe submit workflow

To submit a workflow, please run the following command:

```Bash
qe submit workflow <path/to/workflow.yaml>
```

This will cause Quantum Engine to compile and run your workflow.

Please take note of the workflow ID, which will be printed out after a successful completion of the command above. You will need it to get your workflow results among other uses.


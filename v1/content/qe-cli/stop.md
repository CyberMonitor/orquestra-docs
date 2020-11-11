---
title: QE Stop
summary: Information on the `stop` command on the QE CLI
weight: 6
---

##### Commands

| Command    | Description |
|------------|-------------|
| [`workflow`]({{<ref "#qe-stop-workflow">}}) | Stops a specific resource that is running and removes it from the scheduler|


##### Flags

| Flags   | Description |
|------------|-------------|
| `-h`, `--help` | help for using stop |

___
**Note**: `qe stop` commands require you to be logged in (see [Login](../commands#login)).


## qe stop workflow

To stop a workflow in progress, please run the following command:

```Bash
qe stop workflow <workflow id>
```

This will cause Quantum Engine to immediately terminate your workflow and then removes it from the scheduler.

Any results or metadata up to the time of termination will be saved, and the status of the workflow will be marked as __Terminated__.

Note: A terminated workflow will free up all computing nodes and resources used by the workflow.  




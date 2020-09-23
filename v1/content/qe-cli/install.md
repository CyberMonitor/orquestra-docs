---
title: QE Install
summary: Information on the `install` command on the QE CLI
weight: 6
---

##### Commands

| Command    | Description |
|------------|-------------|
| [`imports`]({{<ref "#qe-install-imports">}}) | Installs all of the imports present in the stipulated workflow locally. |

##### Flags

| Flag        | Argument     | Description |
|------------ |--------------|-------------|
| `-h`, `--help` |           | help for using install |


### qe install imports
Installs the imports in the specified `workflow.yaml` as Python packages on your local machine 

```Bash
qe install imports -f <path/to/workflow.yaml>
```
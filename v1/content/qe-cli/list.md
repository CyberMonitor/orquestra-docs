---
title: QE List
summary: Information on the `list` command on the QE CLI
weight: 5
---

##### Commands

| Command    | Description |
|------------|-------------|
| [`workflow`]({{<ref "#qe-list-workflow">}}) |  Downloads imports locally. |

##### Flags

| Flag        | Argument     | Description |
|------------ |-------------|-------|
| `-l` | int    | Limits the amount of workflow entries returned.<br/> `qe list workflow -l 20`|
| `-o` | `json` | Specify JSON as the preferred output format.<br/> `qe list workflow -o json`|
| `-p`, `--prefix` | string | Filter by the prefix of the workflow name.<br/>  `qe list workflow -p hello`|
| `-d` duration | datetime | Filter by workflows since `-d` time ago.<br/>  `qe list workflow -d 15m`.<br/><br/>Duration can be spcified by<br/> `m` for minutes<br/>`h` for hours<br/>`d` for days<br/>`w` for weeks<br/><br/>Mixed duration units are not allowed, for example `12h15m` is invalid, use `735m` equivalent instead.
 |
| `-s`| string | Filter by the workflow status.<br/>  `qe list workflow -s Error`|
| `-h`, `--help` | | ghelp for using list |



___
**Note**: `qe list` commands require you to be logged in (see [Logging In](../logging-in/)

**Note**: All times in workflows list displayed are in local time based on timezone set on user's computer system in [RFC3399](https://tools.ietf.org/html/rfc3339) format. 
If timezone is not set, UTC is the default.


### qe list workflow
To get the list of your submitted workflows up to a maximum of 200 entries, please run the following command:

```Bash
qe list workflow 
```
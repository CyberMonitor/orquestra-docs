---
title: Get Workflow List
summary: Getting the list of your submitted workflow
weight: 6
---

To get the list of your submitted workflows, please run the following command:

#### Example 1:

Return any workflow list up to a maximum of 200 entries.
```Bash
qe get workflowlist 
```

#### Example 2:

Return a maximum of 20 worklfow entries

```Bash
qe get workflowlist -l 20
```

#### Example 3:

Return a maximum of 20 worklfow entries in JSON format.  If the output format is not specified the default output is text.

```Bash
qe get workflowlist -l 20 -o json
```

#### Example 4:

Return a maximum of 20 worklfow entries, filter on the workflow name with a prefix of `hello`.  The -p or --prefix flag is case insenstive.

```Bash
qe get workflowlist -l 20 -p hello
```

#### Example 5:

Return a maximum of 10 worklfow entries, filter on the workflow name with a prefix of `hello` and within the time duration of 15 minutes. 

```Bash
qe get workflowlist -l 10 -p hello -d 15m
```

The duration can be specified in units:

- `m` for minute
- `h` for hours
- `d` for days
- `w` for weeks

Mixed duration units are not allowed, for example `12h15m` is invalid, use `735m` equivalent instead.

#### Example 6:

Return a maximum of 10 worklfow entries, filter on the workflow name with a prefix of `hello` and a status of `Error`.  The -s or --status flag is case sensitive.

```Bash
qe get workflowlist -l 10 -p hello -s Error
```

#### Example 7:

Get help for `get workflowlist`

```Bash
qe get workflowlist -h
```


___
**Note**: Before you run this command, please make sure you're logged in (see [Logging In](../logging-in)).

___

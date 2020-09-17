---
title: List Workflows
summary: Getting the list of your submitted workflows
weight: 7
---

To get the list of your submitted workflows up to a maximum of 200 entries, please run the following command:

```Bash
qe list workflow 
```

#### Limit the number of results:

Return a maximum of 20 worklfow entries

```Bash
qe list workflow -l 20
```

#### Requesting results in JSON:

Return a maximum of 20 worklfow entries in JSON format.  If the output format is not specified the default output is text.

```Bash
qe list workflow -l 20 -o json
```

#### Filtering workflows by name:

Return a maximum of 20 worklfow entries, filter on the workflow name with a prefix of `hello`.  The -p or --prefix flag is case insenstive.

```Bash
qe list workflow -l 20 -p hello
```

#### Filtering workflows submitted since a time epoch:

Return a maximum of 10 worklfow entries, filter on the workflow name with a prefix of `hello` and since last 15 minutes duration ago. 

```Bash
qe list workflow -l 10 -p hello -d 15m
```

The duration can be specified in units:

- `m` for minute
- `h` for hours
- `d` for days
- `w` for weeks

Mixed duration units are not allowed, for example `12h15m` is invalid, use `735m` equivalent instead.

#### Filter workflows by their status:

Return a maximum of 10 worklfow entries, filter on the workflow name with a prefix of `hello` and a status of `Error`.  The -s or --status flag is case sensitive.

```Bash
qe list workflow -l 10 -p hello -s Error
```

#### Help with workflow list:

Get help for `list workflow`

```Bash
qe list workflow -h
```


___
**Note**: Before you run this command, please make sure you're logged in (see [Logging In](../logging-in)).

All times in workflows list displayed are in local time based on timezone set on user's computer system in [RFC3399](https://tools.ietf.org/html/rfc3339) format. 
If timezone is not set, UTC is the default.
___

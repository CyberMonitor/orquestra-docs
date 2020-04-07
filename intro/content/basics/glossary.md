---
title: Glossary
description: A list of helpful definitions for Orquestra
---

- `Workflow`: An instruction pattern of steps to be performed that is easily reproduceable, distributed, and shareable. 
- `workflowID`: A randomly generated string that is used as an identifier for a specific run of a workflow. Although not guaranteed to be unique, the chance of two repeated workflowIDs is negligible. 
- `Quantum Engine`: The coordinating service that manages running workflows, gathering and distributing logs, and returning the data produced by your workflows.
- `Data Correlation Service`: The service in Orquestra responsible for the correlation and aggregation of all the data produced by a workflow.
- `Resource`: An external and pluggable component that gives your workflow additional functionality. Typically, it contains both source code and templates and exists as a github repository. 
- `Source code`: Code contained in a resource that is callable by resource templates or source code contained in other resources.
- `Resource Template`: A template that is contained in a resource and, when called, executes a script that calls source code. 
- `Workflow Template`: A template that is typically contained inside a workflow that, when called, executes a series of steps.
- `Artifact`: A data object - that is processed and can be shared between different steps in a workflow - that is serialized and represented in a file that can be written to disk (e.g. JSON). 
- `Workflow result`: A file produced by the `Data Correlation Service` that contains data representing all steps and data representing each artifact produced by each step in a workflow. It can easily be used to analyze the data produced by your workflow.
- `Step`: An execution process in a workflow - performed by invoking a template.
- `StepID`: A randomly generated string that is used as an identifier for a specific step. Although not guaranteed to be unique, the chance of two repeated stepIDs is negligible. 
- `Parameter`: A simple variable (e.g. string, integer, float, etc) that is typically passed to a template and can be configured inside of a workflow.
- `Workflow Parameter`: A parameter which can be referred to anywhere inside of the workflow. 
- `Entrypoint`: The template that is called when the workflow begins.
- `generateName`: A string that is used as a prefix for the generation of the `workflowID` and `stepID`'s associated with the given workflow.
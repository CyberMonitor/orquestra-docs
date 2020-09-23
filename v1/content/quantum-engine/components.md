---
title: Components
summary: Components are one of the key building blocks of an Orquestra workflow and allow you to reuse common components and integrations.
weight: 3
---

### Overview

Components represent reusable step inputs of a workflow. Each component is versioned, stored external to Orquestra and treated as the source of truth. When a workflow step begins Orquestra `get` each configured component and ensures it is placed into the runtime environment.

Once a component is placed into the runtime environment, the bits are then available to the task within `/app/qeruntime/task`.

### Where do Components come from?

Each component in the workflow has a `type`. This type determines what bits are retrieved, and where they are placed into the runtime environment.

Orquestra comes with a "core" component type to cover the common use case `git`. Other component types can be community developed, deployed and then used within your workflow as well. 


### Referencing a Component in a Workflow

For a detailed explanation of how to import a component from within a workflow, please refer to the "Components" section in [Workflow Basics](../../quantum-engine/workflow-basics).
To see an example of a `git` component, check out Zapata's [z-quantum-core component](https://github.com/zapatacomputing/z-quantum-core) on GitHub.
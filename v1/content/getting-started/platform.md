---
title: The Orquestra Platform
date: 2018-11-28T15:14:39+10:00
summary:  How Orquestra helps you go from zero to hero with workflows
weight: 1
---

Orquestra is dedicated to making, writing, and deploying workflows simple, shareable, and scalable to meet the needs of scientists and developers. It encourages an incremental approach that allows for swappable simulators and hardware backends, enabling collaboration to utilize best-of-breed quantum systems.

Orquestra can be used as a new layer in your stack that sits between your infrastructure and your applications. It's a combination of open source components, commercial extensions, and cloud services.

## The Components of Orquestra

The figure below shows the major components of Orquestra and how they work together.

![Orquestra Layers](img/orquestra-overview.svg)

Workflows are the blueprint for your experiment. They describe which algorithms to run under which conditions. The Quantum Engine uses your workflows as step-by-step instructions to run your experiment, generate and process your data, and produce results for data analysis.

### Workflows

Your workflow is a description of the different steps required to get the desired experiment's results. The Quantum Engine kicks into gear, spinning up machines, fetching required resources, and executing steps in your workflow until successful completion. Please see the following tutorials that demonstrate how to run quantum experiments on Orquestra: [Bond Length Estimation of H₂](tutorials/simulate-h2-with-vqe/)

### Quantum Engine

Quantum computing is a very fast-moving field. The ability to incorporate the newest algorithms into an existing workflow relies on how well the orchestration is done by the Quantum Engine. Orquestra gives you the capability to seamlessly swap in different sections of your workflows, run them in parallel, and compare results, allowing quicker research and product development.

### Data management

Quantum experiments produce vast amounts of data, quickly exposing some of the limitations of current database management systems. Orquestra automatically handles the management of your data, producing a single, structured, data file that you can use to analyze the results of your experiments.

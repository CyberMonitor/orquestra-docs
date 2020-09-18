---
title: Why Workflows?
date: 2018-11-28T15:14:39+10:00
summary: Why adopting Orquestra workflows will help you get to results faster
weight: 2
---

Managing processes and experiments in modern systems can present a number of challenges. Scientists have to implement new algorithms, distribute them across multiple platforms, and plumb output data into databases. On top of that, scientists then must become data analysts to decide the best way to use the data. All while exploring a challenging new field such as quantum computing.

Adopting workflows in your organization will ease these pain points considerably. Read on to learn how workflows' declarative approach to expressing a process will simplify iteration and enable your team to spend more time making new discoveries. You'll also learn how the Orquestra platform enables faster iteration cycles thanks to its advanced ecosystem of tooling and expressive workflow system.

## What are workflows?

Workflows are text files that specify a sequence of actions necessary to go from nothing to results of scientific and business value. Orquestra's Quantum Engine uses these workflows as a set of instructions to execute your experiment - allowing you go from an idea to a set of results as quickly and easily as possible.

## Why workflows?

### Scientist and developer experiences

Using workflows in your organization via the Orquestra platform can help you discover new algorithms faster due to its natural expression of scientific experiments. Our #1 goal is to simplify process management across the stack. Experiments that are normally difficult to execute, such as optimizations, and visualization suddenly become trivial thanks to Orquestra. Let's learn how!

#### Modern tooling

Developing your workflow with the Orquestra platform gives you access to modern tooling that helps you uncover bugs quickly, gain visibility into your processes, and realize deeper insight into your data with confidence.

### Declarative workflow expression

One of the main advantages of adopting workflows is their declarative approach to expressing a process. No longer will there be numerous files being moved around across virtual machines, HPC clusters, and containers. It is a common situation for scientists and engineers to spend whole days, if not weeks, managing these activities. With these tasks fully automated, the time is brought down to minutes.

With a workflow, there's no need to configure an environment for each step within a process, move code into each step, execute it, and finally aggregate the data manually. Instead, from a high-level, you specify the step you need in your workflow and the Quantum Engine orchestrates how that step meshes with the rest of your workflow.

With a traditional environment, you would have to piece together each step into a bespoke script, which, when called, runs your experiment. Not only is this approach time-consuming, it's also prone to error and difficult to reuse logic. Compare this with a workflow's declarative way of expressing an experiment:

```yaml
- name: star-wars-characters
  config:
    runtime:
      type: python3
      imports: [star-wars]
      parameters:
        file: star-wars/src/python/orquestra/welcome.py
        function: test_artifact
  outputs:
  - name: test_artifact
    type: test
```
#### Ready for production

While there is not a standardized workflow specification, workflows have been in use with Argo since 2017, Apache Airflow since 2014, and a key component of many organizations that use these platforms.

At [Zapata Computing](https://www.zapatacomputing.com/), we have found workflows to be an excellent solution to many of the problems we encountered with existing techniques, and now we use it to power our own experiments.

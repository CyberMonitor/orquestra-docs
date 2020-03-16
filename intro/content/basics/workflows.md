---
title: Orquestra workflows
description: Why adopting Orquestra workflows will help you get to results faster
---

Managing processes and experiments in modern systems can present a number of challenges. Scientists have to implement new algorithms, distribute them across multiple platforms, and plumb output data into databases. On top of that, scientists then must become data analysts to decide the best way to use the data. All while exploring a challenging new field such as quantum computing.

Adopting workflows in your organization will ease these pain points considerably. Read on to learn how workflows' declarative approach to expressing a process will simplify iteration and enable your team to spend more time making new discoveries. You'll also learn how the Orquestra platform enables faster iteration cycles thanks to its advanced ecosystem of tooling and excellent user experience.

## What are workflows?

Workflows are text files that specify through series of steps that encode the sequence of actions necessary to go from nothing to results of scientific and business value.

Workflows are the language that Orquestra's Quantum Engine understands. The Orquestra platform's Quantum Engine takes workflows as inputs and then kicks off the process of execution.

You can learn more about workflows [here](TODO: link to workflows in QE).

## Why workflows?

### Scientist and developer experiences

Using workflows in your organization via the Orquestra platform can help you discover new algorithms faster due to its excellent scientist experience. Our #1 goal is to simplify process management across the stack. Experiments that are normally difficult to execute, such as optimizations, and visualization suddenly become trivial thanks to Orquestra. Let's learn how!

#### Modern tooling

Developing your workflow with the Orquestra platform gives you access to modern tooling that helps you uncover bugs quickly, gain visibility into your processes, and gain deeper insight into data with confidence.

[Orquestra ToolKit](https://github.com/zapatacomputing/zapos-workflow-toolkit) is the only tool in the workflow ecosystem that can provide instant visualization of your workflow. ToolKit displays tasks, artifacts, and the linkage between them, helping you pinpoint bugs and understand performance implications of a step in the workflow.

### Declarative workflow expression

One of the main advantages of adopting workflows is their declarative approach to expressing a process. No longer will there be numerous files being moved around across virtual machines, HPC clusters, and containers. It is a common situation for scientists and engineers to spend whole days, if not weeks, managing these activities. With these tasks fully automated, the time is brought down to minutes. 

With a workflow, there's no need to configure an environment for each step within a process, move code into each step, execute it, and finally aggregate the data manually like you have to with traditional compute clusters. Instead, you specify the exact task you need and the workflow orchestrates exactly what you asked for.

With a traditional environment, you would have to piece together each step into a bespoke script, which, when called, runs your experiment. Not only is this approach time-consuming, it's also prone to error and difficult to reuse logic. Compare this with a workflow's declarative way of expressing an experiment:

```yaml
  - name: world-peace
    container:
      image: orquestra/python3:latest
      command: [sh, -c]
      args: ["python3 main.py"]
```

#### Ready for production

While there is not a standardized workflow specification, workflows have been in use with Argo since 2017, Apache Airflow since 2014, and a key component of many organizations that use these platforms.

At [Zapata Computing](https://www.zapatacomputing.com/), we found workflows to be an excellent solution to many of the problems we encountered with existing techniques, and now use it to power our own experiments.
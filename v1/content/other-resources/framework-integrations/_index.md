---
title: 'Framework Integrations'
description: Integrations with common quantum computing frameworks.
weight: 5
---

Available quantum computing frameworks provide many valuable components, such as classes and functions representing circuits, backends, and optimizers.
Because these frameworks in general not compatible, it can be difficult to swap components from different frameworks.

To make it easier to interchangebly use components from across frameworks, [Z-Quantum](https://github.com/zapatacomputing/z-quantum-core) provides a compatibility layer that integrates widely used frameworks.
This allows components built within these frameworks to be used with [Z-Quantum interfaces](../interfaces) and allows instances of these interfaces to be implemented using different frameworks. 

Note that while the framework integrations provided by Z-Quantum are used in many of the [Orquestra tutorials](../../tutorials), you can also deploy code written with your preferred framework directly as a [workflow step](../../quantum-engine/steps).

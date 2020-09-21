---
title: Overview
summary: An verview of the various components required to have a complete and running Quantum Engine
weight: 1
---

![Quantum Engine](../../img/quantum-engine-components.jpg)

## **Quantum Engine Overview**



|  **Component** | **Description**|
|---|---|
|       **QE**     |
| CLI | The QE CLI is the entrypoint to the Quantum Engine Platform that allows you to submit, manage and get workflows. |
| API  |  RESTful service that that interfaces and handles user interaction with the rest of the quantum engine. It is the gateway for workflows and controls intercommunication between the various components.  |
| Security | Authentication service that acts as an intemediary to an privilaged action the user may take. |
|  **Workflow Engine** | 
| Transpiler  |  Handles logical translation from Orquestra workflow to argo workflow. Controls order of execution of steps.  |
| Argo |  Workflow engine technology used to run workflows.  |
| **DCS** | Data Correlation Service |
| Elastic  |  The service used to handle user workflow logs. Also logs other activities within Quantum Engine, used for debugging purposes.  |
| MongoDB  |  Database that stores artifacts and other information pertaining to user workflows.  |
| S3  |  Stoarge system that holds workflows. Quantum Engine can provide a secure link to download workflows directly from s3.  |


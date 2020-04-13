---
title: Docker Images
description: Access libraries in workflow steps
---

When writing workflows, you often need to use certain libraries. These libraries can be made available to the Quantum Engine by creating Docker images with the libraries you need, or by using one of our pre-made Docker images. For more information about what Docker images are, go to the [Docker website](https://www.docker.com/resources/what-container).


## How to reference Docker images in a resource

In your [resource template](../workflow/templates), add parameters for `docker-image` and `docker-tag` and set their `value`s to the name of the image and the image tag, as shown in the following example:

```YAML
spec:
  templates:
  - name: welcome-to-orquestra
    parent: generic-task
    inputs:
      parameters:
      # Tell Quantum Engine to use the 'open-pack-ml' Docker image for this task
      - name: docker-image
        value: <name-of-dockerhub-repository>/<name-of-image>
      - name: docker-tag
        value: <name-of-tag>
      - name: command
        value: python3 main.py
      artifacts:
      - name: main-script
        path: /app/main.py
        raw:
          data: |
            from orquestra import welcome
            welcome()
    outputs:
      artifacts:
      - name: welcome
        path: /app/welcome.json
```

A full list of pages for Zapata's pre-made images, which contain the `docker-image` and `docker-tag` `value`s, is below:
- [Machine Learning image](../machine-learning/classical-ml)

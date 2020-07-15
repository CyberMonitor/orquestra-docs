---
title: Using Classical Machine Learning Libraries
summary: Accessing common machine learning libraries in a workflow.
weight: 3
---

Zapata provides a pre-made Docker image to make common classical machine learning libraries available for use in workflows. It is called `zapatacomputing/z-ml`. To learn more about using Docker images in Quantum Engine, go to the [Docker images page](../workflow/images).

## Libraries available

The following libraries are included in Zapata's Machine Learning Image:
- numpy v1.18.1
- pandas v1.0.1
- scipy v1.4.1
- scikit-learn v0.22.1
- theano v1.0.4
- tensorflow v2.1.0
- keras v2.3.1
- torch v1.3.0
- gym v0.16.0
- tensorboard v2.1.1
- gpyopt v1.2.6
- cvxopt v1.2.5

## Using the image

To use this image, follow the instructions on the [Docker Images page](../workflow/images), and use the values:
```YAML
- name: docker-image
  value: z-ml
- name: docker-tag
  value: latest
```

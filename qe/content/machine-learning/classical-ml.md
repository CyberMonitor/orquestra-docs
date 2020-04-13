---
title: Using Classical Machine Learning Libraries
description: Easily access common machine learning libraries in a workflow
---

Zapata provides a pre-made Docker image to make common classical machine learning libraries available for use in workflows. To learn more about using Docker images in Quantum Engine, go to the [Docker images page](../workflow/images).

## Libraries available

The following libraries are included in Zapata's Machine Learning Image:
- numpy v1.18.1
- pandas v1.0.1
- scipy v1.4.1
- scikit-learn v0.22.1
- tensorflow v2.1.0
- keras v2.3.1
- torch v1.3.0
- gym v0.16.0
- tensorboard v2.1.1

## Using the image in a resource

To use this image in a [resource](../workflow/resources), follow the instructions on the [Docker Images page](../workflow/images), and use the values:
```YAML
- name: docker-image
  value: zapatacomputing/open-pack-ml
- name: docker-tag
  value: production
```
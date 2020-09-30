---
title: "ML 1: Running a simple workflow"
summary: Learn how to write a workflow template to run a machine learning model.
weight: 3
---

The following three tutorials will take you through the basics of writing and running an Orquestra workflow to train a simple machine learning model.

##### What is Orquestra?
Orquestra is a platform for building repeatable workflows, orchestrated by a quantum engine that systematically organizes experiment data and resources. Orquestra workflows offer solutions when it comes to reproducing experiments, repurposing code, sharing data, and solving dependency problems in projects. For more information, check out this blog [post](https://orquestra.io/post/workflows-and-quantum-go-together-like-peanut-butter-jelly).

##### How does Orquestra work?
Begin by watching an [introductory video](https://youtu.be/yJJ2uhE09eg) about Orquestra and the following three tutorials.

An Orquestra workflow works in a similar way as an actual orchestra. In an orchestra we have the director presiding over a set of musicians, producing a melody. The orchuestra director tells the musicians when to start and end, and she can also pass information to the musicians.

![](../../img/tutorials/OrquestraPicture.png)

In Orquestra, these are the corresponding components:
- **A workflow template:** This is the Orquestra director which dictates what happens in the workflow.
- **Steps:** These are the musicians which play parts of the melody. They correspond to functions, or tasks, that do a particular step.
- **Artifacts:** These can be parameters or data that are passed from the workflow template to the steps, or between steps.

The output of the workflow is also an artifact that gets passed to us when the workflow ends.

Throughout the following three tutorials, we'll teach you the basics of how to build an Orquestra workflow that trains a machine learning model. More specifically:

- In this tutorial, ML Tutorial 1, you'll learn to run a simple workflow that runs pre-written code.
- In the next tutorial, [ML Tutorial 2](../ml-basic-2), you'll be writing the code for the workflow that you run in this tutorial.
- In the third tutorial, [ML Tutorial 3](../ml-basic-3), you'll be writing a more complex workflow.

### 1. In this tutorial
This [video](https://youtu.be/veetJEO0isM) describes what we'll do in this tutorial.

This tutorial will walk you through running a basic Orquestra workflow. The workflow runs  existing code that trains some machine learning models. More specifically, in this tutorial we'll write a workflow template that runs a single step. This step trains a simple machine learning model.

![](../../img/tutorials/ML_Workflow1.png)

The code for this tutorial lives in this [repo](https://github.com/zapatacomputing/tutorial-orquestra-sklearn), and we encourage you to clone it and look at it as you go through the steps below.

### 2. The code
The code we'll run is a simple step (function) called `generate_train`, which trains a machine learning model on a dataset in the following way:
- Takes two inputs:
  - `dataset_name` (string): the name of the dataset, from two choices.
  - `model_name` (string): the name of the model, from three choices.
- Generates the data.
- Trains a model on this data.
- Returns two outputs:
  - The predictions of the model on our dataset (list).
  - The accuracy of the model in the dataset (float). The accuracy is the ratio between the number of correctly classified points and the total number of points.

The function will be treated as a black box during this tutorial, but you can find the code for it [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/tutorial/functions.py).

The two choices for the dataset are `simple_dataset` and `square_dataset`, seen in the image below, where the points with label 1 are drawn as blue triangles, and those with label 0 are drawn as red squares.

![](../../img/tutorials/ML_Datasets.png)

The three choices for the model are `perceptron`, `decision_tree`, and `svm` (for support vector machine). Their boundaries are pictured below on both datasets.

![](../../img/tutorials/ML_Models.png)

Notice, that most models manage to classify the points of the dataset properly, except for one of them. The perceptron model didn't classify the square dataset well, since perceptron models draw a linear boundary, and there is no line that is able to separate the two classes in the square dataset.

A simple example of the `generate_train` function is the following:

```python
>>> generate_train('simple_dataset', 'perceptron')
[0.0, 1.0, 1.0, 0.0], 1.0
```
indicating that the predictions on the four points are 0, 1, 1, 0, and the accuracy is 1.0, since the model predicted all four points correctly.

![](../../img/tutorials/ML_Function.png)

### 3. The workflow template

All we need to do to run this function is the following yaml template [workflow.yaml](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_1/workflow.yaml).

The main parts of this workflow are the following:
- Name
- Components
- Steps
- Types

Now let's study them in detail.

##### 3.1 Name of the workflow
 The first thing to specify is the name of the workflow. this is how we'll be able to fetch the status updates and the output from Orquestra later. The name for our workflow is `ml-1-workflow`, and it is specified with this line of code:
 ```yaml
 name: ml-1-workflow
 ```

 ##### 3.2 Components
 The code that we'll be running is contained in a GitHub repo, and here is where we specify it (and it's branch). We'll give this one the name `sklearn-component`, so that when we need to call it later in the template, we'll use this name. We'll call this a _component_, and a workflow is allowed to have more than one component if you are planning to run code from different GitHub repositories.
```yaml
imports:
- name: sklearn-component
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/tutorial-orquestra-sklearn.git"
    branch: "master"
```

##### 3.3 Steps
Here we specify the steps we'll be running in our workflow to train a perceptron model on the simple dataset. Each step is one function. By default, steps run in parallel, but we can specify dependencies, in other words, we can tell Orquestra if a particular step can't start until another one finishes. In this tutorial, we only have one step, but later in [tutorial 3](../ml-basic-3) we'll be running a workflow with several steps.

Inside each step, we need to specify several things:

###### 3.3.1 Name of the step
Each step needs to have a different name, and we may refer to them in the workflow when it comes to dependencies or outputs, etc. This particular step is called `perceptron-training`, and the name is specified with the following line of code.
```yaml
name: perceptron-training
```

###### 3.3.2 Configuration
This is where we give Orquestra the specifications for the model to run.

In `runtime`, we'll tell Orquestra exactly where the code that we're running lives. Therefore, we refer the GitHub repo we've specified in the imports called `sklearn-component`. Inside this component, we want to run a function called `generate_train_step`, which lives in the file `ml_tutorial_1_step.py` on the path specified below. For this tutorial we'll consider this function a black box, but in the next tutorial you'll get to write it.

```yaml
  config:
    runtime:
      language: python3
      imports: [sklearn-component]
      parameters:
        file: sklearn-component/steps/ml_tutorial_1_step.py
        function: generate_train_step
```
In this section, if needed, we can also specify the computing resources we need for our workflow, such as CPU, memory, etc. This is a small workflow so we'll use Orquestra's defaults, which are the following:
- cpu: "1000m"
- memory: "1Gi"
- disk: "10Gi"

###### 3.3.3 Inputs
In here we specify the inputs to our function. Recall that the function takes two strings, the name of the dataset and the name of the model. We specify it as follows:
```yaml
  inputs:
    - dataset_name: "simple_dataset"
      type: string
    - model_name: "perceptron"
      type: string
```

###### 3.3.4 Outputs
And finally, we specify the outputs, together with its type. For convenience (we'll see this later), the easiest thing is to output a dictionary called `result` containing the output. The step we are running returns this dictionary with keys `predictions` and `accuracy`, where the values are the two desired outputs.

We also need to specify the type of the returned output. In the .yaml file, new custom types can be defined. By default, string, int, float, or bool, are recognized. To keep things simple, we added a custom type called `output_type` in the main part of the .yaml file (which we declare in the next section).
```yaml
  outputs:
  - name: result
    type: output_type
```

##### 3.4 Types
In this section we declare all the types that we've used above for our artifacts. Since the one we used for our output was `output_type`, we declare it here.
```yaml
types:
 - output_type
```

And that's it, our first workflow! Now time to run it in Orquestra.

### 4. Running the workflow in Orquestra
Now that we've written the workflow template, it's time to run it! First, we need some preliminary steps.

##### 4.1 Running the workflow
- Install the [Quantum Engine CLI](https://orquestra.io/docs/qe-cli/install-cli/) (you only need to do this the first time).
- Log into quantum engine by running `qe login -e <your-email> -s <quantum-engine-uri>` in your terminal. Contact support to register your email and/or receive the `quantum-engine-uri`.
- Submit your workflow by running `qe submit workflow <path-to-workflow/workflow.yaml>`

This will return the workflow ID that corresponds to that particular execution of your workflow. The output will look like this:
```Bash
>>> qe submit workflow /path-to-workflow/workflow.yaml

Successfully submitted workflow to quantum engine!
Workflow ID: ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb
```
This workflow ID is what you can use to fetch the status and results of the workflow. The id is composed by the name of the workflow (specified in 2.1) and a unique string generated by Orquestra.

##### 4.2 Workflow progress
The workflow is now submitted to the Orquestra Quantum Engine and will be scheduled for execution when compute becomes available.

To see details of the execution of your workflow, run `qe get workflow <workflow-ID>` with your workflow ID from the prevous step substituted in.

The output will look like this.

```Bash
>>> qe get workflow ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb

STEP                                                               STEP ID                                                              DURATION  MESSAGE
  ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb (qeDagWorkflow)                                                                                         
 └- perceptron-training (perceptron-training)                               ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb-2461011646  9s        result  
```

 In here, the workflow will show every step, with a corresponding unique ID for the step, the time it took to run (the above one took 11 seconds), and information about the output. This workflow only has one step called `perceptron-training`. Notice that at the very right, the output appears as `result`.

##### 4.3 Workflow results
To get the results of your workflow, run `qe get workflowresult <workflow-ID>` with your workflow ID.

```Bash
>>> qe get workflowresult ml-1-84deb2de-d2bd-442a-ab16-5621e098d8d8
```

After a worfkflow runs, it takes time for the data to be processed. This results file cannot be created until the data is done being processed. You can try running the above command every few minutes until it returns a link to download a file.

Once finished, the output will look like the following:

```Bash
Name:        ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb
Location:    http://a49397a7334b711ea99a80ac353ea38d-1340393531.us-east-1.elb.amazonaws.com:9000/workflow-results/ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb.json?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zapata%2F20200920%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20200920T005459Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22ml-1-workflow-6f8d2ae0-a709-4123-ad89-7a46b7a05dcb.json%22&X-Amz-Signature=41f324754914f2521b51f9b37bab82e88dc5e092cff1debe07ec657f507737ad
```
**Note** The above link is only valid temporarily and typically expires after 7 days.

##### 4.4 Downloading the results
When your workflow is completed, the `workflowresult` command will provide you with a http web-link under `Location` in the console output. Click on or copy and paste the link into your browser to download the file.

The file can be seen [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/outputs/ml-1-workflow-output.json).

Note that inside this file, there is a `result` key, and the value is a dictionary. In this dictionary we can see `predictions` and `accuracy`. There is a lot more information there, but under these we can see that the predictions are `0, 1, 1, 0` and the accuracy is `1`, as desired.

##### 4.5 Displaying the results

A simple python script like [this one](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/outputs/display_output.py) will help us display the results.

Output:
```Bash
Predictions
0
1
1
0

Accuracy
1
```

### 5. Exercises

##### Exercise 1: Changing the parameters
Run a similar workflow but change the parameters so that instead of training a perceptron model on the simple dataset, it runs a support vector machine (svm) on the square dataset.

##### Solution
All we have to do here is change the parameter section in the input:

```yaml
  inputs:
    - dataset_name: "square_dataset"
      type: string
    - model_name: "svm"
      type: string
```

The full solution is [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_1/exercise-1.yaml). The output looks like this:
```Bash
Predictions
0
0
0
0
1
1
1
1

Accuracy
1
```


##### Exercise 2: Running a workflow with several steps in parallel
Write a workflow that runs both of the previous jobs in parallel, namely:
- A perceptron model on the simple dataset, and
- a SVM in the square dataset.
Hint: You only need to add them as two steps in the same workflow.

##### Solution

For this, we simply add an extra step to our workflow. We now have two steps which we can call `perceptron-simple` and `svm-square`.

The solution is [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_1/exercise-2.yaml).

### 6. Conclusion
Congratulations! You've ran your first Orquestra workflow to train a machine learning model. In the next [tutorial](../ml-basic-2) we'll open the hood and write the code for the step that you ran in this workflow.
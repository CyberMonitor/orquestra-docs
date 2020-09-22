---
title: "ML 3: Building a modular workflow"
summary: Write a workflow with several steps that trains a machine learning model.
weight: 5
---

In [ML Tutorial 1](http://docs.orquestra.io/tutorials/ml-basic-1) and [ML Tutorial 2](http://docs.orquestra.io/tutorials/ml-basic-2) you learned how to write and run a simple workflow with one step, which trained a machine learning model in sklearn. In this tutorial you'll learn to write a more complex workflow, one with more steps and which passes artifacts (data) between the steps.

![](../../img/tutorials/ML_Workflow3.png)

Why is this important? Modularity is actually one of Orquestra's greatest strengths for the following reasons:
1. **Reusability:** By splitting your code into steps, you can easily reuse these steps in many different workflows.
2. **Flexibility:** You are allowed to switch steps and reuse code from different repositories As new libraries and hardware backends become available, you can plug-and-play them into your workflow seamlessly.

Recall that in the workflow from [ML Tutorial 2](http://docs.orquestra.io/tutorials/ml-basic-2) we ran one step. This step did everything, namely, it generated and preprocessed the data, trained a model, made predictions, and calculated the accuracy. This is too much for one step, it's like directing an orchestra with one musician which plays all the instruments.

In this tutorial we'll modify this and turn it into two steps (don't worry, in the exercises you'll have the chance to turn it into even more steps!). The main things we have to modify from the workflow from the previous owrkflow are the following:

1. Turn the `ml_tutorial_2_step.py` step into two steps, one that generates and preprocesses the data, and one that trains the model, makes predictions, and finds the accuracy.
2. Modify the workflow template to run these two steps in series, and to pass the output of the first step into the second step.

### 1. Preliminaries

The code for this tutorial is all in this [repository](http://www.github.com/zapatacomputing/tutorial-orquestra-sklearn) to follow. We recommend you to clone it to follow this tutorial, although if you'd like the extra challenge, you can make your own repo which will end up with this folder structure. If you use your own repo, make sure you change any references to `tutorial-orquestra-sklearn` to your repo.

```Bash
.
├── examples
│   └── ml_tutorial_3
│           └── workflow.yaml
├── steps
│   └── ml_tutorial_3_steps.py
└── src
    ├── python
    │   └── tutorial
    │       ├── functions.py
    │       └── utils.py
    └── setup.py
```

### 2. Turning the step into two steps

In tutorial 2 we wrote a workflow template to run the function `generate_train_step` which lived in the `tutorial_2_step.py` file. Now, we split this function into two functions:
- `generate_preprocess_step`, which will generate the dataset and preprocess it as features and labels.
- `train_predict_accuracy_step`, which will train the model, make predictions, and calculate the accuracy.

![](../../img/tutorials/ML_TwoSteps.png)

Pay special attention to the outputs of the functions, as they are serialized and saved as json files. The code below can also be found [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/steps/ml_tutorial_3_steps.py).

##### `ml_tutorial_3_steps.py`
```python
from tutorial.functions import *
from tutorial.utils import *

def generate_preprocess_step(dataset_name):
    # Reading the data
    data = generate_dataset(dataset_name)

    # Processing the data
    features, labels = preprocess_data(data)

    # Saving the prediction and score as results
    features_dict = {}
    features_dict['features'] = features
    save_json(features_dict, 'features.json')
    
    labels_dict = {}
    labels_dict['labels'] = labels
    save_json(labels_dict, 'labels.json')

def train_predict_accuracy_step(features, labels, model_name):
    
    feat = read_json(features)['features']
    lab = read_json(labels)['labels']

    # Training the model
    model = train_model(feat, lab, model_name)
    
    # Making predictions
    predictions = make_predictions(model, feat)
    
    # Scoring the model
    accuracy = calculate_accuracy(predictions, lab)
    
    # Saving the prediction and accuracy as results
    result = {}
    result['predictions'] = predictions.tolist()
    result['accuracy'] = accuracy
    save_json(result, 'result.json')
```

Notice that we used a `save_json` and a `read_json` functions. These are located in [utils.py](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/src/python/tutorial/utils.py).

### 3. Adding a step to the workflow template
First we need is to modify the workflow to run two steps instead of one. The first step is called `generate-data` and the second one `train-model`. The resulting workflow template is [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_3/workflow.yaml).

Pay special attention to the output of the first step. This step has two ouputs, `features` and `labels`, and they are both numpy arrays. We have created two classes to hold them, called `features_type` and `labels_type` (and we have declared them at the end of the workflow template).
```yaml
  outputs:
  - name: features
    type: features_type
  - name: labels
    type: labels_type
```

Next, we make sure that these steps don't run in parallel, since `train-model` needs to run after `generate-data`. This is done with the following line of code:
```yaml
passed: [generate-data]
```

And finally, we send the features and labels as input to the train-model step, making sure we specified the type.
```yaml
  inputs:
    # We input the features and labels from the generate-data step
    - features: ((generate-data.features))
      type: features_type
    - labels: ((generate-data.labels))
      type: labels_type
    - model_name: "perceptron"
      type: string
```

### 4. Running the workflow
When we run this workflow in Orquestra, we can see the different steps and the output from each of them.

Note that the output from the first step is `features, labels`, and the output from the second (final) step is `result`.

```Bash
>>> qe submit workflow path/to/workflow.yaml
Successfully submitted workflow to quantum engine!
Workflow ID: ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e

>>> qe get workflow ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e
Name:                ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e
Namespace:           default
Status:              Succeeded
Created:             Sun Sep 20 02:25:31 +0000 (39 seconds ago)
Started:             Sun Sep 20 02:25:31 +0000 (39 seconds ago)
Finished:            Sun Sep 20 02:25:53 +0000 (17 seconds ago)
Duration:            22 seconds
Parameters:          
  s3-bucket:         quantum-engine
  s3-key:            projects/v1

STEP                                                               STEP ID                                                              DURATION  MESSAGE
  ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e (qeDagWorkflow)                                                                                                  
 ├- generate-data (generate-data)                                           ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e-994578722   11s       features,labels  
 └- train-model (train-model)                                               ml-3-workflow-26c594c7-a4c6-4d79-a782-ef9a7dbbd53e-1611110470  9s        result 
```

After running `qe get workflowresult`, storing the results, like in [ML Tutorial 1](http://docs.orquestra.io/tutorials/ml-basic-1), one gets a results file like [this one](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/outputs/ml-3-workflow-output.json). Using a [script](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/outputs/display_output.py), we can print out the results and get the following:

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


### 5. Exercise: Modularizing the template even more
In this tutorial we wrote a workflow consisting of two steps:
- `generate_preprocess_data`: Generates the dataset and preprocesses it into features and labels.
- `train_predict_accuracy`: Trains the model, makes predictions, and finds the accuracy of the model.

In this exercise, you'll turn it into a workflow consisting of five steps:
- `generate_data`: Generates the dataset.
- `preprocess_data`: Preprocesses the dataset into features and labels.
- `train_predict`: Trains the model and makes predictions.
- `calculate_accuracy`: Calculates the accuracy of the model in the dataset.

The outputs of this dataset are the predictions and the accuracy.

![](../../img/tutorials/ML_ExerciseWorkflow.png)

##### 5.1 Solution

We need to write a workflow with 4 steps. The links to the answers are below.
- [Steps](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/steps/ml_tutorial_3_steps.py)
- [Workflow](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_3/exercise.yaml)


 ### 6. Combining code from different components
One of the greatest strengths of Orquestra is the ability to combine code from different sources. For example, you may find a workflow very useful in Zapata's (or someone else's) repo and you may want to run it, but changing a small function on it. This is very easy to do using workflows.

For example, let's say that we want to run the workflow from Exercise 5 which lives in this [repo](www.github.com/zapatacomputing/tutorial-orquestra-sklearn). However, we are not interested in the accuracy of the model. Instead, we want to calculate another metric, say, the [F1-score](https://en.wikipedia.org/wiki/F1_score). What we'll do is write this function in another component and call it from the workflow template.

![](../../img/tutorials/ML_WorkflowComponents.png)

##### 6.1 Create the component
The idea is that we want to run functions from the `tutorial-orquestra-sklearn` repo, but without modifying it. So to follow this exercise, we recommend you to create one called `tutorial-additional-metrics` using your personal GitHub account. You can see the solutions in [here](https://github.com/zapatacomputing/tutorial-additional-metrics).

The folder structure is the following.

 ```
.
├── examples
│   └── additional-metrics-workflow.yaml
├── steps
│   └── f1_score_step.py
└── src
    ├── python
    │   └── metrics
    │       ├── functions.py
    │       └── utils.py
    └── setup.py
 ```

In `functions.py`, write the function for calculating `f1_score`, and call this function in `f1_score_step.py` just as before.

##### `functions.py`

 ```python
from sklearn.metrics import f1_score

def calculate_f1_score(predictions, labels):
    f1 = f1_score(predictions, labels)
    return f1
 ```

##### `f1_score_step.py`
 ```python
from metrics.functions import calculate_f1_score
from metrics.utils import read_json, save_json

def calculate_f1_score_step(labels, predictions):
    lab = read_json(labels)['labels']
    pred = read_json(predictions)['predictions']

    f1_score = [calculate_f1_score(pred, lab)]

    f1_score_dict = {}
    f1_score_dict['f1_score'] = f1_score
    save_json(f1_score_dict, 'f1_score.json')
 ```

Also, make sure you have a `utils.py` in the same folder that will help us read and save json files. The code can be found [here](https://github.com/zapatacomputing/tutorial-additional-metrics/blob/master/src/python/metrics/utils.py).

Also, we need a `setup.py`. Don't forget to change the name of the repo in line 6 to your own.

##### `setup.py`
 ```python
import setuptools

setuptools.setup(
    name                            = "tutorial-additional-metrics",
    description                     = "Additional metrics for models in orquestra.",
    url                             = "https://github.com/zapatacomputing/tutorial-additional-metrics",
    packages                        = setuptools.find_packages(where = "python"),
    package_dir                     = {"" : "python"},
    classifiers                     = (
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ),
    install_requires = [
        "sklearn",
        "numpy",
   ],
)
 ```

And finally, the workflow should look like this. Notice that we are calling two different components, `additional-metrics` for calculating the f1-score and `tutorial-orquestra-sklearn` for all the other functions.

##### `other-metrics-workflow.yaml`

```yaml
# Workflow API version
apiVersion: io.orquestra.workflow/1.0.0

# Prefix for workflow ID
name: additional-metrics

# List components needed by workflow.
imports:
- name: sklearn-component
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/tutorial-orquestra-sklearn.git"
    branch: "master"
- name: additional-metrics-component
  type: git
  parameters:
    repository: "git@github.com:zapatacomputing/tutorial-additional-metrics.git"
    branch: "master"

steps:

# This step runs the step that generates the dataset 
- name: generate-data
  config:
    runtime:
      language: python3
      imports: [sklearn-component]
      parameters:
        file: sklearn-component/steps/ml_tutorial_3_exercise_steps.py
        function: generate_data_step
  inputs:
    - dataset_name: "simple_dataset"
      type: string
  outputs:
  - name: data
    type: dataset_type

# This step runs the step that preprocesses the data
- name: preprocess-data
  passed: [generate-data]
  config:
    runtime:
      language: python3
      imports: [sklearn-component]
      parameters:
        file: sklearn-component/steps/ml_tutorial_3_exercise_steps.py
        function: preprocess_data_step
  inputs:
    - data: ((generate-data.data))
      type: dataset_type
  outputs:
  - name: features
    type: features_type
  - name: labels
    type: labels_type

# This step runs the step that trains the model and makes the predictions
- name: train-predict
  passed: [preprocess-data]
  config:
    runtime:
      language: python3
      imports: [sklearn-component]
      parameters:
        file: sklearn-component/steps/ml_tutorial_3_exercise_steps.py
        function: train_predict_step
  inputs:
    - model_name: "perceptron"
      type: string
    - features: ((preprocess-data.features))
      type: features_type
    - labels: ((preprocess-data.labels))
      type: labels_type
  outputs:
  - name: predictions
    type: predictions_type

# This step runs the step that calculates the f1-score of the model
- name: calculate-f1-score
  passed: [train-predict]
  config:
    runtime:
      language: python3
      imports: [additional-metrics-component]
      parameters:
        file: additional-metrics-component/steps/f1_score_step.py
        function: calculate_f1_score_step
  inputs:
    - predictions: ((train-predict.predictions))
      type: predictions_type
    - labels: ((preprocess-data.labels))
      type: labels_type
  outputs:
  - name: f1_score
    type: f1score_type
types:
 - dataset_type
 - features_type
 - labels_type
 - predictions_type
 - f1score_type
```

##### 6.2 Submit the workflow and display the results

Just like before, we can submit the workflow and display the [outputs](https://github.com/zapatacomputing/tutorial-additional-metrics/blob/master/examples/additional-metrics-output.json) with a [script](https://github.com/zapatacomputing/tutorial-additional-metrics/blob/master/examples/display_output.py) to get the following.

```Bash
Predictions
0
1
1
0
F1-score:
1
```

### 7. Conclusions
Congratulations! In this tutorial you've learned how to write complex workflows. We now invite you to check out some of the more advanced [tutorials](http://docs.orquestra.io/tutorials/) in other classical and quantum algorithms to really harness the power of Orquestra!
---
title: "ML 2: Building a simple workflow"
summary: Write a simple workflow that trains a machine learning model.
weight: 4
---

This [video](https://youtu.be/5d2EUbZxQjc) describes what we'll do in this tutorial.

In [ML Tutorial 1](http://docs.orquestra.io/tutorials/ml-basic-1) you learned to run a workflow which ran an existing step that trained a machine learning model. In this tutorial you'll learn how to build the step.

![](../../img/tutorials/ML_Workflow2.png)

Recall that in Tutorial 1, we built a workflow template that ran a function called `generate_train`, which generates a dataset, trains a machine learning model on it, and then outputs the predictions and the accuracy of the model on that same dataset.

![](../../img/tutorials/ML_Function.png)

The code to run this function locally is below. Our goal is to turn this code into Orquestra, to be able to run it with the workflow template from Tutorial 1.

### 1. The code
Here is the code that we have in our machine, that we intend to run in Orquestra. There are two files, one is called `main.py` which contains the main function `generate_train`, and the other one is called `functions.py`, which contains the helper functions.

The `generate_train` function does the following:
- Generates the data based on the name of the dataset that we input.
- Preprocesses the data by splitting it into features and labels.
- Trains a model on this data, based on the name of the model that we input.
- Makes predictions on the existing dataset using the model.
- Calculates the accuracy of the model.
- Outputs the predictions and the accuracy.
##### `main.py`
```python
from functions import *

def generate_train(dataset_name, model_name):
    # Generates the data. The two choices for the name of the dataset are
    # 'simple_dataset' and 'square_dataset'
    data = generate_dataset(dataset_name)

    # Preprocesses the data by splitting it into features and labels
    features, labels = preprocess_data(data)
    
    # Trains the model. The three choices for the name of the model
    # are 'perceptron', 'decisiontree' and "svm"
    model = train_model(features, labels, model_name)
    
    # Makes predictions using the model and the features
    predictions = make_predictions(model, features)
    
    # Calculates the accuracy of the model on the training dataset
    accuracy = calculate_accuracy(predictions, labels)
    
    # Outputs the predictions and the accuracy of the model
    return predictions, accuracy
```

Each of the helper functions above has been implemented in the following file.

##### `functions.py`
```python
import pandas as pd
import numpy as np
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# Generates the data. The two choices for the name of the dataset are
# 'simple_dataset' and 'square_dataset'
def generate_dataset(dataset_name = "simple_dataset"):
    if dataset_name == "simple_dataset":
        data = pd.DataFrame({
            'x_1': [1.0, 0.0, -1.0, 0.0],
            'x_2': [0.0, 1.0, 0.0, -1.0],
            'y': [0, 1, 1, 0]
        })
    if dataset_name == "square_dataset":
        data = pd.DataFrame({
            'x_1': [1.0, 1.0, -1.0, -1.0, 2.0, 2.0, -2.0, -2.0],
            'x_2': [1.0, -1.0, 1.0, -1.0, 2.0, -2.0, 2.0, -2.0],
            'y': [0,0,0,0,1,1,1,1]
        })
    return data

# Preprocesses the data by splitting it into features and labels
def preprocess_data(data):
    features = np.array(data[data.keys()[:-1]])
    labels = np.array(data[data.keys()[-1]])
    return features, labels

# Trains a perceptron model
def train_perceptron(features, labels):
    model = LogisticRegression()
    model.fit(features, labels)
    return model

# Trains a decision tree model
def train_decision_tree(features, labels):
    model = DecisionTreeClassifier()
    model.fit(features, labels)
    return model

# Trains a support vector machine
def train_svm(features, labels):
    model = SVC()
    model.fit(features, labels)
    return model

# Trains the model. The three choices for the name of the model
# are 'perceptron', 'decision_tree' and "svm"
def train_model(features, labels, model_name="perceptron"):
    if model_name == "perceptron":
        return train_perceptron(features, labels)
    if model_name == "decisiontree":
        return train_decision_tree(features, labels)
    elif model_name == "svm":
        return train_svm(features, labels)
    else:
        return train_perceptron(features, labels)

# Makes predictions using the model and the features
def make_predictions(model, features):
    predictions = model.predict(features)
    return predictions

# Calculates the accuracy of the model on the training dataset
def calculate_accuracy(predictions, labels):
    accuracy = accuracy_score(predictions, labels)
    return accuracy
```

### 2. Folder structure of the workflow
For code to run in Orquestra it needs to live in a GitHub repo. Go to [GitHub](http://www.github.com) and create a public repository called `tutorial-orquestra-sklearn` (or any name you'd like to use). If you are unfamiliar with GitHub you can reference their [create a repo guide](https://help.github.com/en/github/getting-started-with-github/create-a-repo) for help.

This repository will be where you build the component that we call in the workflow template. [This GitHub repo](https://www.github.com/tutorial-orquestra-sklearn) can be used as a reference for how the repo `tutorial-orquestra-sklearn` should look like throughout the tutorial.

Once we have the GitHub repo, we need to define the folder structure of our workflow. In order to be recognized by Orquestra, a component must contain two folders: one for the steps (called `steps`) and one for the source code that these steps are running (here called `tutorial`). A typical Orquestra workflow has a folder structure similar to the following:

- `examples` folder: Where one stores the workflow templates and the outputs, as well as any scripts to read and plot the outputs (this folder doesn't need to be pushed to GitHub).
- `steps` folder: Where the steps are stored.
- `tutorial` folder: Where the helper functions are stored.

More specifically, here is the folder structure of our existing workflow. The workflow template `tutorial_2_workflow.yaml` is very similar to that of the previous tutorial, minus some changes that we'll see later. For the rest of files don't worry, we'll get to all of them in this tutorial.

```Bash
├── examples
│    └── ml_tutorial_2
│           └── workflow.yaml
├── steps
│    └── ml_tutorial_2_step.py
├── tutorial
│    ├── __init__.py
│    ├── functions.py
│    └── utils.py
└── setup.py
```

### 3. Turning the code into a step
Turning the code into a step is very simple. The code almost stays the same, except for the output, which we need to tweak a little bit. The `functions.py` file needs no modifications at all, and you can find it [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/tutorial/functions.py). The `main.py` file does. Recall that our original `generate_train` function outputs two things: predictions and accuracy. We modify this to output one thing: a dictionary called `result` that stores the predictions and accuracy under keys called `predictions` and `accuracy`. We also need to pass this result as a json file, for which we'll use another helper function called `save_json`.

Here is the modified [step](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/steps/ml_tutorial_2_step.py) that we'll run in Orquestra. Note that the difference from the original `generate-train` function at the beginning of the tutorial only lies in the last 4 lines of code.

##### `ml_tutorial_2_step.py`
```python
from tutorial.functions import *
from tutorial.utils import *

# This is the task for Tutorial 2
# It does an end-to-end job, from generating the dataset
# to making the predictions and scoring the model

def generate_train_step(dataset_name, model_name):
    # Reading the data
    data = generate_dataset(dataset_name)

    # Processing the data
    features, labels = preprocess_data(data)
    
    # Training the model
    model = train_model(features, labels, model_name)
    
    # Making predictions
    predictions = make_predictions(model, features)
    
    # Calculating the accuracy of the model
    accuracy = calculate_accuracy(predictions, labels)
    
    # Saving the prediction and score as results
    result = {}
    result['predictions'] = predictions.tolist()
    result['accuracy'] = accuracy
    save_json(result, 'result.json')
```

We use the `save_json` function, which is a standard json encoder and lives in [`utils.py`](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/tutorial/utils.py). Also, we need an [`__init__.py`](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/tutorial/__init__.py). Copy the contents of those files from the linked files on GitHub into your own `utils.py` and `__init__.py`.

By convention, the functions that are relevant to our training are in `functions.py`, while those that help us with serializing input/output and similar tasks are in `utils.py`.

### 4. Installations, etc.
The last thing we need to do is tell Orquestra what packages we need to run our code. We do this in the file `setup.py`, which should live in the root folder of our repo. For this workflow, we use `sklearn`, `numpy`, and `pandas`.

The file looks like [this](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/setup.py), where the packages that we need to import are under `install_requires`. In your code, change the url to your own GitHub repo. 

### 5. Write workflow template and submit!
Now that we've built our Orquestra workflow, all that's needed is to write the workflow template and submit! This has all been done in [ML Tutorial 1](../ml-basic-1), so please head there for the instructions. The workflow template is [here](https://github.com/zapatacomputing/tutorial-orquestra-sklearn/blob/master/examples/ml_tutorial_2/workflow.yaml) for reference.

Make sure you commit your changes and push then to your GitHub repo!

The only thing you need to change is the GitHub repository. In lines 12 and 13 of the above file, add the path to your GitHub repo and the branch (usually master or main).

### 6. Conclusion

Congratulations! You have now written your first Orquestra workflow. In the next [tutorial](../ml-basic-3) you'll learn how to write a more complex workflow that runs more than one step.
---
title: Installation
description: How to download and install Quantum Engine
---

The Quantum Engine is accessible via the `qe` CLI tool which needs to be installed beforehand.
We provide the `qe` CLI tool for all 3 major platforms, namely Mac OS, Linux, and Windows.

## Using the installation script

### Mac and Linux

1. Go to the [Quantum Engine CLI releases page](https://github.com/zapatacomputing/quantum-engine/releases) and download `install.sh`. The latest release is recommended.

1. Execute the following by opening your Terminal and running:
```Bash
chmod u+x ~/Downloads/install.sh && ~/Downloads/.install.sh
```

### Windows

1. Go to the [Quantum Engine CLI releases page](https://github.com/zapatacomputing/quantum-engine/releases) and download `install.bat`. The latest release is recommended.

1. Execute the following by opening your Command Line and running:
```PowerShell
C:\Users\<username>\Downloads\install.bat
```

## Manual installation of binaries

In case you wish to choose where the CLI binary is placed in your system (e.g. due to security constraints), please follow the instructions below.

### Mac and Linux

1. Go to the [Quantum Engine CLI releases page](https://github.com/zapatacomputing/quantum-engine/releases) and choose the version suitable for your machine. The latest release is recommended.

1. Once you have downloaded the CLI tool, place it in a directory of your choice by opening your Terminal and running:
```Bash
mv ~/Downloads/qe-cli-darwin-amd64 </path/to/directory>
```

1. Update your `~/.bashrc` or `~/.zshrc` file to add the directory to your `$PATH` by adding the line:
```Bash
export PATH=</path/to/directory>:$PATH
```

1. Reload your `~/.bashrc` or `~/.zshrc` so that the changes made in the previous step take effect by running the following in your Terminal:
```Bash
source ~/.bashrc
```
or
```Bash
source ~/.zshrc
```

1. Rename the file to be called `qe` by running:
```Bash
mv </path/to/directory>/qe-cli-darwin-amd64 </path/to/directory>/qe
```

1. Make the file executable by running:
```Bash
chmod a+x </path/to/directory>/qe
```

1. Now you can call the CLI tool as `qe`, and it should display the list of available commands and additional help.

1. Note: on Mac OS Catalina, you will not be able to run the command due to security restrictions, so after the first attempt to use the Quantum Engine CLI, which will fail, please head to the `Security and Privacy` setting, select the `General` tab, and at the bottom, you will given the option to run the binary as an exception.

### Windows

1. Go to the [Quantum Engine CLI releases page](https://github.com/zapatacomputing/quantum-engine/releases) and choose the version suitable for your machine. The latest release is recommended.

1. Once you have downloaded the CLI tool, place it in a directory of your choice by opening your Command Line and running:
```PowerShell
move C:\Users\<username>\Downloads\qe-windows-amd64 C:<\path\to\directory>
```

1. Update your `PATH` so that Windows can find the binary by running:
```PowerShell
set PATH=%PATH%;C:<\path\to\directory\>
```

1. Rename the file to be called `qe.exe` by running:
```PowerShell
rename C:<\path\to\directory>\qe-windows-amd64 qe.exe
```

1. Now you can call the CLI tool as `qe`, and it should display the list of available commands and additional help.

## Using package managers

### Mac

If you have `brew`, you can use our `brew` package to install Quantum Engine:
```Bash
brew tap zapatacomputing/qe && brew install qe
```

### Linux

If you have `Snapcraft`, you can use our `snap` package to install Quantum Engine:
```Bash
snap install qe --classic
```

### Windows

If you have `Chocolatey`, you can use our `choco` package to install Quantum Engine:
```PowerShell
choco install qe -confirm
```

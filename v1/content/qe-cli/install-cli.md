---
title: Installing the CLI
summary: Install the Quantum Engine CLI to interface with Orquestra
weight: 1
---

The first step to getting started with Orquestra is to install the `qe` CLI tool. 

Throughout the Orquestra documentation we'll stick to the long-form name of every command and flag. Once you've learned what the commands do, you may want to consult `qe -h` to learn the short forms.

## Before you begin

It is recommended to use a CLI version that is consistent with the Quantum Engine Server version. The `qe` command will warn you if it notices that your CLI version is out of sync with the server.
## Download & Install

### macOS

1. Make sure you have `curl` installed. You can check by opening the Terminal app and typing `curl` into the command line. 

2. Run the install script by pasting the following command into the macOS Terminal:

```bash
sudo /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/zapatacomputing/qe-cli/master/install.sh)"
```

### Linux

1. Make sure you have `curl` installed using the package manager for your distribution of Linux.

2. Paste the following command into the Linux shell prompt:

```bash
sudo /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/zapatacomputing/qe-cli/master/install.sh)"
```

### Windows

1. Download the latest `qe` binary for Windows on the `qe-cli` [release page](https://github.com/zapatacomputing/qe-cli/releases). For 32-bit Windows users you'll want to download `qe-windows-386`; 64-bit Windows users will use `qe-windows-amd64`
2. Locate the binary and rename it to `qe.exe`
3. Move `qe.exe` to the `%SystemRoot%\system32` folder or add `qe.exe` to your PATH 

**Warning** 
* `qe install` is not yet supported on Windows

### Windows with WSL
Installation should be very similar to Linux OS. However, you'll need to ensure that the 64-bit version of the binary is installed

1. Download the 64-bit version of the Linux binary `qe-linux-amd64` on the [release page](https://github.com/zapatacomputing/qe-cli/releases)

2. In your terminal navigate to the folder where you downloaded the binary and rename it by running 
```bash
mv ./qe-linux-amd64 ./qe
```

3. Make the binary executable by running 
```bash
chmod +x ./qe
```

4. Copy the binary to a general location by running 
```bash
sudo cp ./qe /usr/local/bin/
```

### Notes
If the above scripts do not work, you can download `qe` from [github](https://github.com/zapatacomputing/qe-cli/releases/latest) as a binary. There are individual download links for common platforms.
ds
#### ssh-agent and ssh keys
On some OS platforms, `ssh-agent` changes do not persist across different shell sessions; consequently you may need to add the same key in different shell sessions using `ssh-add -k` all over again.

To remedy this, you may incorporate the following script `ssh-agent-activate.sh` into your shell startup script.

Example for Bash shells:

```Bash
echo 'source ~/qe/bin/ssh-agent-activate.sh' >> ~/.bashrc
```



---
title: QE CLI commands
summary: Reference guide for the commands in the qe CLI
weight: 2
---


|  Command | Description | 
|----------|-------------|
| [Login]({{<ref "#login">}}) | Login to Orquestra  |
| [Update]({{<ref "#update">}}) | Update specified resource(s) locally |
| [Version]({{<ref "#version">}}) |  Display Quantum Engine version |
| [Help]({{<ref "#help">}}) |  Help about any command  |
| [Submit](../submit/) | Submits one or more resources |
| [Get](../get/) | Displays information about one or more resources |
| [List](../list/) |  Displays a resource list  |
| [Install](../install/) | Installs one or more resources |

## Login

In order to start being productive with Orquestra, you need to log into the platform using the Quantum Engine CLI.

The Quantum Engine assumes that you have registered your login credentials with Zapata Computing. If you have not, please contact support.

```Bash
qe login -s <quantum-engine-server-uri>
```

where the `quantum-engine-server-uri` will be provided to you by Orquestra Support.

**Note**: Currently, login is supported using `OpenIdConnect` and you will get an access token that is valid for 24 hours once you have sucessfully logged in and approved access to required resources.
          If your access token has expired, you will be asked to re-authenticate to get a new token.

## Update 

The `update` command can be used to update the currently installed version of the `QE cli` with the current Orquestra platform server version.

**Example usage:**
```Bash
qe update cli [flags]
```

**Note:** Depending on where your `qe` CLI is installed you may need to run the above command with `sudo`

###### Flags 

| Flag | Description |
| -----|-------------|
| `-h, --help`  |  Print help text for the command |
| `-y, --yes`   |  Don't prompt for confirmation before performing the update.|


## Version
Get the version of the `qe` CLI and the version of the quantum engine server

**Example usage:**
```Bash
qe version
```

## Help
Get help on a command and its supported flags and arguments

**Example usage:**
```Bash
qe help
```

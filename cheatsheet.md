# Quantum Engine CLI commands:
#### To login to QE
- `qe login -e <your-email-address> -s <quantum-engine-server-uri>`

#### To submit a workflow
- `qe submit workflow <path/to/workflow.yaml>`

#### To get the current progress of a workflow
- `qe get workflow <workflow ID>`

#### To get the logs of a workflow step
- `qe get logs <workflow ID> -s <step name>`

#### To get the json results of a workflow
- `qe get workflowresult <workflow ID>`

# Other useful commands:
## `watch`
- The `watch` command allows you to not have to keep typing the same command over and over again
- For instance, if you want to see when a new step is run in `qe get workflow <workflow ID>`, instead of typing the same command multiple times, just type `watch -c qe get workflow <workflow ID>`
- Now it will update whenever there is a new change in the workflow status

## Using Aliases
- The `alias` command in a terminal allows you to add shorthand ways to call other commands
- If you only want to use these aliases for one terminal session, feel free to just type them in
- To make the changes "permanent", copypaste these commands to your ~/.bash_aliases file, if it exists
  - If you don't have a ~/.bash_aliases file, just copypaste directly into your ~/.bashrc or your ~/.zshrc
  - Once they are in in one of those files, source the file (eg: `source ~/.bashrc`)
- Now when you want to run one of the aliased commands, you only have to use the alias instead of the whole command
 - For example where before the alias you would have had to type `qe submit workflow <path/to/workflow.yaml>`, now you can just type `qes <path/to/workflow.yaml>`

## Useful aliases
```bash
alias qes='qe submit workflow'
alias qew='watch -c qe get workflow'
alias qer='qe get workflowresult'
alias qewr='watch -c qe get workflowresult'
```

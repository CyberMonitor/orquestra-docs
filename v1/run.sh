  
#!/bin/bash

set -e -u

hugo
hugo server -D -v --baseURL ""
#!/bin/bash

set -euo pipefail

cd "$PROJECT_ROOT/generator" && npm run generate

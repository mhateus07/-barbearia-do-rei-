#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
export TEST_DATABASE_URL=postgresql://postgres:salon_test_only@127.0.0.1:55439/salon_test_a
export TEST_DATABASE_URL_B=postgresql://postgres:salon_test_only@127.0.0.1:55439/salon_test_b
npm test

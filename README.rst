=========================================
MatchCode approximate code search tests
=========================================

This repository is a test suite for approximate code search including AI-generated code search.

- Homepage: https://github.com/aboutcode-org/matchcode-tests/
- Related repos:

  - https://github.com/aboutcode-org/purldb
  - https://github.com/aboutcode-org/matchcode-toolkit
  - https://github.com/aboutcode-org/ai-gen-code-search


Usage
=====

- Clone this repository
- In the clone, run ``make dev``
- run ``. venv/bin/activate``
- run the full test suite with::

    pytest -vvs tests

This is designed to run only on Linux.

License
=============

- the data is under a CC-BY-4.0 license
- the code is under the Apache-2.0 license
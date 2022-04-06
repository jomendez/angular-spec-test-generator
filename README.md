[![NPM version](https://badge.fury.io/js/angular-spec-test-generator.svg)](http://badge.fury.io/js/angular-spec-test-generator)

# angular-spec-test-generator

> Angular spec generator, generate all spec file by sample cli.

## Description

Automatically create All spec file by cli.

## Install
```npm install -g angular-spec-test-generator```

## Usage

```bash
angular-spec-test-generator 'C:\Users\userName\test'
```

select a directory where you want to generate spec files, and then it will generate all Angular spec based on the components, pipes, services, guards and directives that you have in that folder.

> This script will only generate file when spec file doesn't exist, and the component / directive / guard / pipe / service follows the angular-cli file generate name.

## Configuration

You can set type to configurate which types you want to generate.
### Type

```--type=guard,component,service ```

|type|alias|
|---|---|
|guard|`g` or `guard`|
|component|`c` or `component`|
|service|`s` or `service`|
|directive|`d` or `directive`|
|pipe|`p` or `pipe`|

### Force

It will force replace exist spec files

```--force ```

### Clear

It will clear select spec with type

```--clear```
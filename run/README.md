# Run

Runs scripts and saves output to variables

## Usage

```yaml
jobs:
  test:
    steps:
    - uses: ./run
      id: test
      with:
        script: |
          echo "Testing action"
```

## Arguments

| variable              | description                                                     | required | default               |
|-----------------------|-----------------------------------------------------------------|----------|-----------------------|
| script                | Script or command to execute                                    | true     |                       |
| working-directory     | Script working directory                                        | false    |                       |


## Outputs

| variable              | description                                                     | 
|-----------------------|-----------------------------------------------------------------|
| stdout                | Executed script stdout                                          |
| stderr                | Executed script stderr                                          |
| exit                  | Executed exitcode                                               |
| success               | Is exitcode 0 or not                                            |

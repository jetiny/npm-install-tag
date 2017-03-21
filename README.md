# npm-install-tag

npm install with tag dependencies


#### Uesage

your package.json
```js
{
  "devDependencies": {
    "deps": "next"
  },
  "dependencies": {
    "something": "latest"
  }
}
```

add npm-install-tag to package.json
```
{
    "postinstall": "npm-install-tag",
    "devDependencies": {
        "npm-install-tag": "latest",
    }
}
```

#### cli

```
  Usage: npm-install-tag [options]
  Options:
    -h, --help                 output usage information
    -V, --version              output the version number
    -p, --path [path]          package.json path default pwd
    -o, --override [override]  override package.json with resolved version
```

# Logical Folders

Logical folders, allows you to setup filters for different file types/extensions and display them in 'logical' or 'virtual' folders to make navigating/organization easier.

This was based on the virtual folders project from "Gruntfuggly".
Forked the repo and did modifications on it, you can find the original here: https://github.com/Gruntfuggly/virtual-folders

### Source Code

GitHub [repo](https://github.com/imFS/logical-folders).

## Configuration

The extension can be configured under the name:
`logical-folders.folders`

You will have to modify your settings.json in vscode, Example:

```
{
    "logical-folders.folders": [
        {
            "name": "JS Files",
            "files": [
                "*.js"
            ]
        },
        {
            "name": "Json Files",
            "files": [
                "*.json"
            ]
        },
        {
            "name": "CPP",
            "files": [
                "*.cpp"
            ]
        },
        {
            "name": "Headers",
            "files": [
                "*.h",
                "*.hpp"
            ]
        },
        {
            "name": "ASM",
            "files": [
                "*.asm"
            ]
        }
    ]
}
```

### Credits

"Gruntfuggly" he is the reason I was able to do something so quick.
After hours of looking around that defines what I wanted he had the exact project, only sad part was vscode api limitations and the project being old.
Also me melting my brain trying to write code in JS, again 10+ hours gone just because I'm too blind.

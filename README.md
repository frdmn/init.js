# init.js

[![Current tag](http://img.shields.io/github/tag/[GitHubUsername]/init.js.svg)](https://github.com/frdmn/init.js/tags) [![Repository issues](http://issuestats.com/github/frdmn/init.js/badge/issue)](http://issuestats.com/github/frdmn/init.js)

![](http://i.imgur.com/HN4YlY9.gif)

A simple NodeJS based command line utility to quickly initialize a developer workspace / git repository including README templates and license files.

## Installation

1. Make sure you've installed all requirements
2. Install the project globally using `npm`:

    ```shell
    npm install -g init.js
    ```

## Usage

* Create a new folder for your new project:

    ```shell
    mkdir test-project
    ```

* Change into that directory:


    ```shell
    cd test-project
    ```

* Run `init.js`:

    ```shell
    init
    ```

You can optionally pass the following arguments:

```
Usage: init [options]

Options:
  -h, --help        Show help and usage information
  -v, --version     Display version information                                                 [default: false]
  -i, --ignore-git  Ignore existing .git folder in the current directory, can be true or false  [default: false]
```

#### Custom templates

Since version 1.2.0 you are able to add custom readme and license templates without sending a pull request on GitHub nor adding them in the `node_modules/` folder.

Just create a directory called `.initjs` in your home folder and drop your template readmes into `~/.initjs/readmes/` and licenses ([obviously](https://i.imgur.com/eGHU2IZ.gif)) into `~/.initjs/licenses/`. 

#### Automatically replace GitHub username

If you have the `github.user` git configuration set - it will replace your GitHub user automatically. You can set it usig the following command:

```
git config --global github.user YourUsername
```

## Contributing

1. Fork it
2. Create your feature branch:

    ```shell
    git checkout -b feature/my-new-feature
    ```

3. Commit your changes:

    ```shell
    git commit -am 'Add some feature'
    ```

4. Push to the branch:

    ```shell
    git push origin feature/my-new-feature
    ```

5. Submit a pull request

## Requirements / Dependencies

* NodeJS
* Existing `.gitconfig`

## Version

1.2.6

## License

[MIT](LICENSE)

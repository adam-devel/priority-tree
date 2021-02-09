# Building instructions

## 1. Get `npm`

`npm` is Nodejs's package manger, one of the benifits of using npm is easier tasks and dependencies management.

installing `npm` is a requirement since it's used by this project.

-  Install under Arch Linux:

   i suppose you already know...
   install npm by running this in a terminal:

   ```sh
   pacman -S npm
   ```

-  Windows users, other Linux distros and other OS's:

   check npm's ["get npm"](https://www.npmjs.com/get-npm).

   note: you will be introducted to installing nodejs, which npm is part of

## 2. Get the source code

to _build the project from source_, you obviously need the _source_ code.

this repository contain the source code, clone it using `git`

in a terminal run:

```sh
  git clone https://www.gitub.com/adam-devel/priority-tree
```

if you don't have `git` install it

<details>
   <summary>or ... </summary>
   you can download a <a href="https://github.com/adam-devel/priority-tree/archive/main.zip">zip file</a> from github contaning the source code , note that this will require re-downloading the source code to update it and is very inconvinent in many ways
</details>

## 3. Install the development dependencies

these are just the tools needed to build the project.

to install them, run:

```sh
npm install
```

## 4. Build the project

and finally just run:

```sh
npm run build
```

## Launch the project

open the `index.html` file with your browser of choice

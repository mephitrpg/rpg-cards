rpg-cards
=========

RPG spell/item/monster card generator

Preview
=======

Click [here](https://mephitrpg.github.io/rpg-cards/) for a live preview of this generator.

Documentation
=============

Click [here](https://mephitrpg.github.io/rpg-cards/documentation.html) to read the documentation.

Installation and Updating
=========================

This project consists almost exclusively of static HTML/CSS/JavaScript files, but it needs to be build at least one time to work.

The build will update /generator/icons folder with content from:
- The [game-icons](http://game-icons.net) project.
- Fonts from the [gameicons-font](https://seiyria.com/gameicons-font) project.
- And any .png or .svg files you have added to ./resources/custom-icons (you must build the project and refresh the page in the browser in order to use them).


To setup or update this project:

1. Checkout this GIT repository
2. Make sure you have [Node.js](https://nodejs.org/) installed. The Node installation usually bundles the `npm` command-line interface. We strongly recommend using a Node version manager like [nvm](https://github.com/nvm-sh/nvm) to install Node.js and npm.
3. Open the Terminal (or Command Prompt for Windows)
4. Go to the repository folder
4. Run `npm install`

To build this project:

- Run `npm run build`

To lanunch the generator locally on your browser:

- Run `npm start` to run the local HTTP server, then open one of the indicated URLs (e.g. http://localhost:8080) in your browser. Please use localhost instead of other aliases, since it is treated as a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts). This enables access to more advanced JavaScript features.

To deply the generator into a website:

- Deploy the content of the `./generator` folder to your server (i.e. using an FTP client)


Support
=======

I (the original author) am not maintaining the project anymore, and will not be responding to issues or reviewing PRs.
However, I have given write access to a few collaborators that are maintaining the project.
Please reach out to me if you want to be included as collaborator, or if you want to take ownership of this project.


Cloud integration
=================

The hosted generator can support Dropbox without using a shared Dropbox app. Each
user can create and configure their own Dropbox app, then connect it from the
generator. This keeps each user's Dropbox authorization separate.


FAQ
=====================

- What browsers are supported?
  - A modern browser (Chrome, Edge, Safari).
  - IE and Firefox are not supported (Firefox due to privacy concerns).
- Cards are generated without icons and background colors, what's wrong?
  - Enable printing backround images in your browser print dialog
- The layout of the cards is broken (e.g., cards are placed outside the page), what's wrong?
  - Check your page size, card size, and cards/page settings. If you ask the generator to place 4x4 poker-sized cards on a A4 paper, they won't fit and they will overflow the page.

License
=======

This generator is provided under the terms of the MIT License.

Icons are made by various artists, available at [http://game-icons.net](http://game-icons.net).
They are provided under the terms of the Creative Commons 3.0 BY license.

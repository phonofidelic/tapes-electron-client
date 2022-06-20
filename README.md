# tapes-electron-client
This project is second iteration of [Tapes](https://github.com/phonofidelic/Tapes). Full readme is in progress.

## Development
This project uses the SoX command line utility (v12.4.2) for recording audio. Install the Mac and Windows binaries from [here](https://sourceforge.net/projects/sox/files/sox/14.4.2/) and include them in the ```bin``` directory in the root of this project.

### Textile API keys
To enable Textile Hub API authentication, create a `.env` in the root directory and set the USER_API_KEY field:
```
USER_API_KEY=<YOUR_TEXTILE_HUB_USER_GROUP_KEY>
```
See [Textile Hub: Authentication & authorization](https://textileio.github.io/js-textile/docs/#authentication--authorization) for more information.

### Install packages: 
`yarn`

### Start the development environment:
`yarn start`

### Run unit tests:
`yarn test`

### Run e2e test:
`yarn test:e2e`

### Debug packaged app:
`lldb out/Tapes-darwin-arm64/Tapes.app`
Then in repl:
`run --remote-debugging-port=8315`
Source: https://stackoverflow.com/a/56634497
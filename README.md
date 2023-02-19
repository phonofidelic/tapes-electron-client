# Tapes
_This project is second iteration of [Tapes](https://github.com/phonofidelic/Tapes). Full readme is in progress._

## Introduction

### Overview
Tapes is intended to be an intuitive, low latency interface for creating and cataloging audio recordings using the computer’s default audio input device (mic input or USB capture device). 

Recordings are cached locally on the user's computer, and then stored on [IPFS](https://ipfs.io/) via [Web3.Storage](https://web3.storage/). The database layer is managed using [OrbitDB](https://github.com/orbitdb/orbit-db), which is a distributed peer-to-peer database technology also built on IPFS.

### Motivation
Part of my motivation behind this project is to gain a deeper understanding of the various technologies and frameworks used to build it. It also proved to be a good way to introduce myself to some basic concepts of audio signal processing and dealing with digital audio data. My main motivation however, was to build a tool that I found useful and pleasant to work with. I wanted an application that could quickly record musical ideas or sound samples with minimal setup and also allow for efficient archiving of the generated material.

### Use Cases:
#### _Audio Recording and Cataloging_
As mentioned above, the initial use case for the application is a way to quickly record audio and to have a way to easily archive and search through these recordings. 

#### _Digitization of Analog Music_
Another use case that came up during the course of development was that of digitizing analog recordings from mediums such as vinyl records or tape cassettes.

The application uses [AcoustID](https://acoustid.org/) and [MusicBrainz](https://musicbrainz.org/) to search for and add metadata to the recordings.

---

## Development

### Binary Dependencies
This project uses the following binaries which must be included in the `bin` directory:

#### [SoX](http://sox.sourceforge.net/)
This project uses the SoX command line utility (v14.4.2) for recording audio. Install the Mac and Windows binaries from [here](https://sourceforge.net/projects/sox/files/sox/14.4.2/).

#### [Chromaprint - fpcalc](https://acoustid.org/chromaprint)
Tapes uses the [AcoustID](https://acoustid.org/) API for audio identification. In order to do this, an audio fingerprint must be generated using Chromaprint.

#### [Audiodevice](http://whoshacks.blogspot.com/2009/01/change-audio-devices-via-shell-script.html)
A commandline tool used to programmatically set the default audio input device.


### API keys
API keys and tokens need to be obtained for the following services:

#### AcoustID
The AcoustID web service is used for audio identification. You can register your application and obtain an API key [here](https://acoustid.org/webservice).

#### GitHub 
A GitHub token is used when publishing releases. You can read more about this [here](https://www.electronforge.io/config/publishers/github).

#### Web3.Storage
Web3.Storage is used to store audio files on the decentralized web (IPFS). Read more about this [here](https://web3.storage/).

Once keys have been obtained, set them in a `.env` file in the project root:
```
ACOUSTID_API_KEY=<KEY_VALUE>
GITHUB_TOKEN=<TOKEN_VALUE>
WEB3STORAGE_TOKEN=<TOKEN_VALUE>
```
See [Textile Hub: Authentication & authorization](https://textileio.github.io/js-textile/docs/#authentication--authorization) for more information.

### Install packages: 
`yarn`

<i>__NOTE:__</i> If you are working on a mac, run `TARGET_ARCH=x64 yarn` 
</br><i>TODO: explain why</i>

### Start the Electron development environment:
`yarn start`

### Start the web client environment:
`yarn start:web`

### Run unit tests:
`yarn test`

### Run e2e test:
`yarn test:e2e`

### Debug the packaged app:
`lldb out/Tapes-darwin-arm64/Tapes.app`

Then in repl:
`run --remote-debugging-port=8315`

_Source: https://stackoverflow.com/a/56634497_
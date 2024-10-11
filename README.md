# Formant 3D Viewer Module

An open-source module for visualizing spatial data on Formant. You can use this viewer to build up complex 3D scenes driven by Formant data for both real-time and historical viewing. Additionally, you can fork this repo to create viewers with your own custom layers for interaction and visualization.

# Technologies Used

- Typescript
- ThreeJS
- React
- React Three Fiber

# Important locations

- `src/layers/` - This is where the data visualizations live and where you can put yours
- `public/config.schema.json` - This is the configuration file used for this module that drives the 3D viewers configuration screen
- `src/Viewer.tsx` - This is the scene that is put together for the module
- `src/buildScene.tsx` - This file helps convert a configuration into the various layers of the scene
- `src/Demo.tsx` - This is a scene that can be used for quickly iterating on viewer and a layer locally
- `src/layers/common/ExampleUniverseData.ts` - This is a simulated data endpoint you can use to simulate data and receiving calls from your layers

# How do I extend the 3D viewer

At a very high level there's 3 important things you need to do:

- Create your new layer in `src/layers/`, and connect your 3D elements to data received by the `UniverseData`context of your scene
- Extend the configuration screen ( or replace it ) with the configuration parameters of your 3D viewer
- Make sure `buildScene` knows how you handle your new configuration and translate it to the layers you want

# How do I make my version of 3D viewer into it's own module in Formant

- You must build your 3D viewer and take the files from it's `dist` output into somewhere on public on the internet
- You can make organization-available module by going to your Formant account, Settings screen, Modules section.
- Add a new module:
  - Put in the url of your 3D viewer
  - Put in the url of your `config.schema.json`
- You will now be able to add modules to your views and configure them as other modules

# Examples and Documentation

- [Introduction to 3D Viewer](https://docs.formant.io/docs/3d-viewer)
  <img src="https://user-images.githubusercontent.com/66638393/217696414-56af0957-de44-4b78-9b0b-7a77b6484d15.png" width="200"/>

- [Create a simple interactable layer for 3D Viewer](https://docs.formant.io/recipes/create-a-layer-in-3d-viewer)
  <img width="200" src="https://user-images.githubusercontent.com/66638393/217696316-4c2a9d23-1f47-4f1d-8f27-c82855269781.png">

- [Create a module configuration](https://docs.formant.io/recipes/create-a-simple-module-configuration)
  <img width="200" alt="Screen Shot 2023-02-08 at 5 56 05 PM" src="https://user-images.githubusercontent.com/66638393/217697145-165b4924-8615-4b78-8052-64651fce43df.png">

- [How to get a module configuration and updates](https://docs.formant.io/recipes/how-to-get-a-module-configuration-and-updates)

# Where are versions

| Env   | Url                                                          | Version |
| ----- | ------------------------------------------------------------ | ------- |
| Prod  | https://formantio.github.io/3d-viewer-module/versions/prod/  | 0.170.6 |
| Stage | https://formantio.github.io/3d-viewer-module/versions/stage/ | 0.170.7 |
| Dev   | https://formantio.github.io/3d-viewer-module/versions/dist/  | 0.170.7 |

# How do I run 3D viewer when i'm developing on it?

```
yarn
yarn dev
```

The server will be running on `http://127.0.0.1:5173`

1. Go to your Formant organization Settings -> Modules
2. Add a new module "3D Viewer Dev"
3. Set the `url` : `http://127.0.0.1:5173`
4. Set the `configuration schema url` : `http://127.0.0.1:5173/config.schema.json`
5. Save
6. Now you can to to a view and add your development module to a view, configure it, and work on it.

# How to deploy a new version

To cut a new version of dev

```
git checkout master
make deploy
```

To cut a new version of staging

```
git checkout master
make cut-stage
make deploy
```

To update staging branch

```
git checkout refs/tags/stage
<cherrypick change or modify directly>
make update-stage
git checkout master
make deploy
```

To promote staging to prod

```
git checkout master
make promote-stage-to-prod
make deploy
```

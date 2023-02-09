# Formant 3D Viewer Module

An open-source module for visualizing spatial data on Formant.  You can use this viewer to build up complex 3D scenes driven by Formant data for both real-time and historical viewing.  Additionally, you can fork this repo to create viewers with your own custom layers for interaction and visualization.

# Technologies Used

* Typescript
* ThreeJS
* React
* React Three Fiber

# Examples and Documentation

* [Introduction to 3D Viewer](https://docs.formant.io/docs/3d-viewer)
* [Create a simple interactable layer for 3D Viewer](https://docs.formant.io/recipes/create-a-layer-in-3d-viewer)

# How do I run 3D viewer when i'm developing on it?

```
yarn
yarn dev
```

The server will be running on `http://127.0.0.1:5173`

1. Go to your Formant organization Settings -> Modules
2. Add a new module "3D Viewer Dev"
3. Set the `url` :  `http://127.0.0.1:5173`
4. Set the `configuration schema url` : `http://127.0.0.1:5173/config.schema.json`
5. Save
6. Now you can to to a view and add your development module to a view, configure it, and work on it.

# Formant 3D Viewer Module

An open-source module for visualizing spatial data on Formant.  You can use this viewer to build up complex 3D scenes driven by Formant data for both real-time and historical viewing.  Additionally, you can fork this repo to create viewers with your own custom layers for interaction and visualization.

# Technologies Used

* Typescript
* ThreeJS
* React
* React Three Fiber

# Examples and Documentation

* [Introduction to 3D Viewer](https://docs.formant.io/docs/3d-viewer)
<img src="https://user-images.githubusercontent.com/66638393/217696414-56af0957-de44-4b78-9b0b-7a77b6484d15.png" width="200"/>

* [Create a simple interactable layer for 3D Viewer](https://docs.formant.io/recipes/create-a-layer-in-3d-viewer)
<img width="200" src="https://user-images.githubusercontent.com/66638393/217696316-4c2a9d23-1f47-4f1d-8f27-c82855269781.png">

* [Create a module configuration](https://docs.formant.io/recipes/create-a-simple-module-configuration)
<img width="200" alt="Screen Shot 2023-02-08 at 5 56 05 PM" src="https://user-images.githubusercontent.com/66638393/217697145-165b4924-8615-4b78-8052-64651fce43df.png">


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

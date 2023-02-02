# Formant 3D Viewer Module

An open-source module for visualizing spatial data on Formant.  You can use this viewer to build up complex 3D scenes driven by Formant data for both real-time and historical viewing.  Additionally, you can fork this repo to create viewers with your own custom layers for interaction and visualization.



https://user-images.githubusercontent.com/66638393/216462090-7fdfc464-5ae8-46b5-bb41-764afc620706.mov



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

function convertObjectToArray(obj: any) {
  const arr: any[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    arr[parseInt(key, 10)] = value;
  });
  return arr;
}

function generateNoise(width: number, height: number) {
        const pattern = new Array(height).fill(null).map(() => new Array(width));

        function lerp(a: number, b: number, t: number) {
            return a + (b - a) * t;
        }
    
        function smooth(x: number) {
            return x * x * (3 - 2 * x);
        }
    
        function generateBaseNoise(width: number, height: number) {
            const noise = new Array(height).fill(null).map(() => new Array(width));
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    noise[y][x] = Math.random() + 0.5;
                }
            }
            return noise;
        }
    
        // Interpolated noise (FBM with multiple octaves)
        function fbm(x: number, y: number, noise: number[][], octaves = 4, persistence = 0.5, lacunarity = 2.0) {
            let amplitude = 1.0;
            let frequency = 1.0;
            let total = 0.0;
            let maxAmplitude = 0.0;
    
            for (let i = 0; i < octaves; i++) {
                const sampleX = (x * frequency) % width;
                const sampleY = (y * frequency) % height;
    
                const x0 = Math.floor(sampleX);
                const x1 = (x0 + 1) % width;
                const y0 = Math.floor(sampleY);
                const y1 = (y0 + 1) % height;
    
                const tx = sampleX - x0;
                const ty = sampleY - y0;
    
                const sx = smooth(tx);
                const sy = smooth(ty);
    
                const v00 = noise[y0][x0];
                const v01 = noise[y0][x1];
                const v10 = noise[y1][x0];
                const v11 = noise[y1][x1];
    
                const ix0 = lerp(v00, v01, sx);
                const ix1 = lerp(v10, v11, sx);
                const value = lerp(ix0, ix1, sy);
    
                total += value * amplitude;
                maxAmplitude += amplitude;
    
                amplitude *= persistence; // Reduce amplitude
                frequency *= lacunarity;  // Increase frequency
            }
    
            return total / maxAmplitude; // Normalize the value between 0 and 1
        }
    
        const baseNoise = generateBaseNoise(width, height);
    
        // Fill the pattern with blobby values using FBM
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Get the fractal noise value at this point (adjust scaling for more blobs)
                const value = fbm(x / 16, y / 16, baseNoise, 5, 0.5, 2.0); // 5 octaves for more blob structure
    
                // Scale the value to be between 0 and 255
                pattern[y][x] = Math.floor(value * 255);
            }
        }
    
        return pattern.flat();
}

function generateRipplePointCloud(numRipples: number, pointsPerRipple: number, maxRadius = 2, noiseAmplitude = 2) {
  const pointCloud = [];

  function noise1D(x: number) {
      return (Math.sin(x) + Math.random()) * 0.5; 
  }

  for (let ripple = 0; ripple < numRipples; ripple++) {
      const radius = 2 + (ripple / numRipples) * maxRadius; // Increase radius for each ripple
      const amplitude = noiseAmplitude * Math.exp(-ripple / numRipples); // Decay amplitude with distance

      for (let i = 0; i < pointsPerRipple; i++) {
          const angle = (i / pointsPerRipple) * 2 * Math.PI; 

          const x = radius * Math.cos(angle);
          const z = radius * Math.sin(angle);

          const noise = noise1D(radius + angle);
          const y = noise * amplitude; 

          pointCloud.push(z, x, y );
      }
  }

  return pointCloud;
}

export const occupancyMap = {
  width: 128,
  height: 128,
  worldToLocal: {
    translation: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  },
  resolution: 0.029999999329447746,
  origin: {
    translation: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  },
  data: generateNoise(128, 128),
};

export const pointCloud = {
  worldToLocal: {
    translation: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  },
  pcd: {
    colors: Array.from({ length: 1000 }, () => [0, 0, 0, 1]).flat(),
    header: {
      count: [1, 1, 1, 1],
      data: "binary_compressed",
      fields: ["x", "y", "z", "rgb"],
      height: 1,
      points: 1000,
      size: [4, 4, 4, 4],
      type: ["F", "F", "F", "F"],
      version: "0.7",
      width: 1000,
    },
    positions: generateRipplePointCloud(4, 250),
  },
};

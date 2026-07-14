const fs = require('fs');

const filePath = './src/components/3d/environment/PawprintBay.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `  const bayDetails = useMemo(() => ({
    plazaFlowerBeds: [
      { position: [7.8, 0, 3.4] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], scale: 0.78 },
      { position: [-7.8, 0, -3.4] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], scale: 0.78 }
    ],
    trees: [
      { position: [-32, 0, 24] as [number, number, number], scale: 1.05, blossom: true },
      { position: [-27, 0, 34] as [number, number, number], scale: 0.95, blossom: true },
      { position: [33, 0, 25] as [number, number, number], scale: 1.05, blossom: false }
    ],
    pines: [
      { position: [-26, 1.45, -28] as [number, number, number], scale: 1.3 },
      { position: [-20, 1.45, -34] as [number, number, number], scale: 1.4 }
    ],
    picnicNooks: [], fishingNooks: [], mailTables: [], teaNooks: [],
    beachLounges: [], lookoutNooks: [], gardenWorkPatches: [], dockWorkNooks: [],
    grassTufts: [],
    mushrooms: [],
    groundPatches: [],
    shellMosaics: [],
    pawInlays: [],
    pathPebbles: [],
    bushes: [
      { position: [-30, 0, 20] as [number, number, number], scale: 1.2 },
      { position: [28, 0, 22] as [number, number, number], scale: 1.1 }
    ],
    rocks: [
      { position: [-24, 1.45, -25] as [number, number, number], scale: 1.5, rotation: [0, 0.4, 0] as [number, number, number] }
    ],
    shellClusters: [],
    lamps: [
      { position: [-12, 0, 12] as [number, number, number] },
      { position: [12, 0, -12] as [number, number, number] }
    ],
    boats: [
      { position: [48, -0.4, 12] as [number, number, number], rotation: [0, -Math.PI / 6, 0] as [number, number, number], color: "#D93D4A" }
    ],
    lilyPads: [
      { position: [-5, -0.45, -45] as [number, number, number], scale: 1.0, hasFlower: true },
      { position: [5, -0.45, -48] as [number, number, number], scale: 0.8, hasFlower: false }
    ],
    waterPlants: [],
    cozyCargo: [
      { position: [42, -0.4, 5] as [number, number, number], rotation: [0, 0.2, 0] as [number, number, number], scale: 1.0 }
    ],
    beachGlass: [],
    ambientInsects: [
      { position: [25, 1.2, -25] as [number, number, number], color: "#D93D4A", radius: 4 },
      { position: [20, 1.0, 20] as [number, number, number], color: "#FDFBF7", radius: 3 }
    ],
    palmTrees: [
      { position: [-12, -0.4, 45] as [number, number, number], scale: 1.2 },
      { position: [15, -0.4, 48] as [number, number, number], scale: 1.4 }
    ]
  }), []);`;

const startIndex = content.indexOf('const bayDetails = useMemo(() => ({');
const endStr = '}), []);';
const endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endStr.length);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed file.');
} else {
  console.log('Could not find bounds.');
}

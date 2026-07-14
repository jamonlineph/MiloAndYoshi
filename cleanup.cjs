const fs = require('fs');

const filePath = './src/components/3d/environment/PawprintBay.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const arrayNames = [
  'plazaFlowerBeds', 'trees', 'pines', 'picnicNooks', 'fishingNooks', 'mailTables', 'teaNooks',
  'beachLounges', 'lookoutNooks', 'gardenWorkPatches', 'dockWorkNooks', 'grassTufts', 'mushrooms',
  'groundPatches', 'shellMosaics', 'pawInlays', 'pathPebbles', 'bushes', 'rocks', 'shellClusters',
  'lamps', 'boats', 'lilyPads', 'waterPlants', 'cozyCargo', 'beachGlass', 'ambientInsects', 'palmTrees'
];

for (const name of arrayNames) {
  const regex = new RegExp(`(${name}:\\s*\\[)([\\s\\S]*?)(\\]\\s*,)`, 'g');
  content = content.replace(regex, (match, p1, p2, p3) => {
    let items = p2.split(/(?<=\}|\])\s*,/);
    items = items.map(item => item.trim()).filter(item => item.length > 0);
    
    let keepCount = 4;
    if (['lamps', 'trees', 'pines', 'palmTrees', 'cozyCargo'].includes(name)) keepCount = 5;
    if (['grassTufts', 'mushrooms', 'rocks', 'bushes', 'waterPlants', 'lilyPads'].includes(name)) keepCount = 6;
    if (['ambientInsects'].includes(name)) keepCount = 3;
    if (['groundPatches', 'shellMosaics', 'pawInlays', 'pathPebbles', 'beachGlass', 'shellClusters'].includes(name)) keepCount = 0; // Remove these completely to clean the floor
    
    const keptItems = items.slice(0, keepCount);
    if (keptItems.length === 0) {
       return `${p1}\n      ${p3}`;
    }
    return `${p1}\n      ${keptItems.join(',\n      ')}\n    ${p3}`;
  });
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleanup complete!');

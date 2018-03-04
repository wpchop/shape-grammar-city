import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import City from './geometry/City';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import Turtle from './lsystem/Turtle';
import Perlin from './Perlin';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  branch: [150.0, 150.0, 160.0],
  leaf: [33.0, 100.0, 240.0],
  shader: 'lambert',
  iterations: 5,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let city: City;
let count = 0;

let lsystem: LSystem;
let perlin: Perlin;

function loadScene() {
  city = new City(vec3.fromValues(0,0,0));
}

function loadLSystem(lsystem: LSystem) {
    let str = " ";
    lsystem = new LSystem(str, controls.iterations);
    city = new City(vec3.fromValues(0,0,0));
    // Expand grammar
    lsystem.expandAxiom(controls.iterations);
  
    let col1 : vec4 = vec4.fromValues(controls.branch[0]/255,controls.branch[1]/255,controls.branch[2]/255, 1.0);
    let col2 : vec4 = vec4.fromValues(controls.leaf[0]/255,controls.leaf[1]/255,controls.leaf[2]/255, 1.0);

    // Fill mesh
    let turtle : Turtle = new Turtle(col1, col2, controls.iterations);
    turtle.drawFloor(city);

    perlin = new Perlin();

    for (let x = -100; x < 100; x+= 10) {
      for (let y = -100; y < 100; y+= 10) {
        let pos = vec3.fromValues(x, 0 ,y);
        let noiseSample = perlin.PerlinNoise(x / 2, y / 2, 0.1);
        let height = Math.floor(noiseSample * 5);

        let xAbs = Math.abs(x);
        let yAbs = Math.abs(y);
        let dist = 2 * (1 - ((xAbs + yAbs) / 200)); 
        height = Math.floor(height + dist);

        if (xAbs + yAbs < 30) {
          height += Math.floor(10 * Math.random() + noiseSample * 10);
        }

        if (xAbs + yAbs < 60) {
          height += Math.floor(5 * Math.random() + noiseSample * 5);
        }

        if (xAbs + yAbs < 100) {
          height += Math.floor(4 * Math.random() + noiseSample * 4);
        }

        let scale = vec3.fromValues(1,1,1);
        console.log(height);

        let sx = Math.random() * 3;
        let sz = Math.random() * 3;

        let r = sz / 3 * 0.55;
        let g = sx / 3 * 0.4 + 0.3;
        let b = noiseSample * 0.5 + Math.random() * 0.3 + 0.2;
        let color = vec4.fromValues(r, g, b, 1);

        vec3.add(scale, scale, vec3.fromValues(sx, 0, sz));
        turtle.draw(city, lsystem.getAxiom(height), pos, scale, color);
      }
    }

    city.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  let iterations = gui.add(controls, 'iterations', 1, 6).step(1);
  let branch = gui.addColor(controls, 'branch');
  let leaf = gui.addColor(controls, 'leaf')

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  const camera = new Camera(vec3.fromValues(80, 40, 80), vec3.fromValues(0, 20, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.60, 0.80, 0.95, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // Make LSystem
  loadLSystem(lsystem);

  // This function will be called every frame
  function tick() {
    count++;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    let col: vec4 = vec4.fromValues(controls.branch[0]/255,controls.branch[1]/255,controls.branch[2]/255, 1.0);
    let shader = lambert;
    renderer.render(camera, shader, col, count, [
      city,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  iterations.onFinishChange(function(value: any) {
    renderer.clear();
    loadLSystem(lsystem);
  });

  leaf.onChange(function(value: any) {
    renderer.clear();
    loadLSystem(lsystem);
  });

  branch.onChange(function(value: any) {
    renderer.clear();
    loadLSystem(lsystem);
  });
  // Start the render loop
  tick();
}

main();

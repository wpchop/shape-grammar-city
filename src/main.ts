import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import Plant from './geometry/Plant';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import LSystem from './lsystem/LSystem';
import Turtle from './lsystem/Turtle';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  axiom: 'A',
  branch: [108.0, 186.0, 115.0],
  leaf: [133.0, 108.0, 187.0],
  shader: 'lambert',
  iterations: 4,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let plant: Plant;
let count = 0;

let lsystem: LSystem;

function loadScene() {
  plant = new Plant(vec3.fromValues(0,0,0));
}

function loadLSystem(lsystem: LSystem) {
    lsystem = new LSystem(controls.axiom, controls.iterations);
    plant = new Plant(vec3.fromValues(0,0,0));
    // Expand grammar
    lsystem.expandAxiom(controls.iterations);
  
    let col1 : vec4 = vec4.fromValues(controls.branch[0]/255,controls.branch[1]/255,controls.branch[2]/255, 1.0);
    let col2 : vec4 = vec4.fromValues(controls.leaf[0]/255,controls.leaf[1]/255,controls.leaf[2]/255, 1.0);

    // Fill mesh
    let turtle : Turtle = new Turtle(col1, col2, controls.iterations);
    turtle.draw(plant, lsystem.LinkedListToString(lsystem.axiom));
    plant.create();
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
  let axiom = gui.add(controls, 'axiom');
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

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

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
      plant,
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

  axiom.onFinishChange(function(value: string) {
    renderer.clear();
    loadLSystem(lsystem);  
  });

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

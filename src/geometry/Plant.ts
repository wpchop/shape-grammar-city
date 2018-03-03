import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Plant extends Drawable {
  plantIndices: number[];
  plantPositions: number[];
  plantNormals: number[];
  plantColors: number [];

  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  center: vec4;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.plantIndices = [];
    this.plantPositions = [];
    this.plantNormals = [];
    this.plantColors = [];
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
  }

  create() {

    this.indices = Uint32Array.from(this.plantIndices);
    this.normals = Float32Array.from(this.plantNormals);
    this.positions = Float32Array.from(this.plantPositions);
    this.colors = Float32Array.from(this.plantColors);

    this.generateIdx();
    this.generatePos();
    this.generateNor();
    this.generateCol();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);

    console.log(`Created plant`);
  }
};

export default Plant;

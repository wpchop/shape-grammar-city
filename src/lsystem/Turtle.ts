import {vec3, vec4, mat4, quat} from 'gl-matrix';
import City from '../geometry/City';

class TurtleState {
  position: vec3 = vec3.create();
  orientation: vec3 = vec3.create();
  depth: number;
  q: quat;

  constructor(position: vec3, q: quat, depth: number) {
    this.position = position;
    this.q = q;
    this.depth = depth;
  }

}

export class Turtle {

  turtleIndices: number [];
  turtleNormals: number [];
  turtlePositions: number [];

  translate: mat4;
  rotate: mat4;
  scale: mat4;

  turtleStack: TurtleState [];

  turtleState: TurtleState;

  iterations: number;

  branchCol: vec4;
  leafCol: vec4;

  constructBaseINP() {
    this.turtleIndices.push(0, 1, 2,
      0, 2, 3,
      4, 5, 6,
      4, 6, 7,
      8, 9, 10,
      8, 10, 11,
      12, 13, 14,
      12, 14, 15,
      16, 17, 18,
      16, 18, 19,
      20, 21, 22,
      20, 22, 23);
    this.turtleNormals.push(0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, 1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      0, 0, -1, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      1, 0, 0, 0,
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      -1, 0, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, 1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0,
      0, -1, 0, 0);
    this.turtlePositions.push(
      // front
      -1, -1, 1, 1,
      1, -1, 1, 1,
      1, 1, 1, 1,
      -1, 1, 1, 1,
      // back
      -1, -1, -1, 1,
      1, -1, -1, 1,
      1, 1, -1, 1,
      -1, 1, -1, 1,
      // right
      1, -1, -1, 1,
      1, 1, -1, 1,
      1, 1, 1, 1,
      1, -1, 1, 1,
      // left                                     
      -1, -1, -1, 1,
      -1, 1, -1, 1,
      -1, 1, 1, 1,
      -1, -1, 1, 1,
      // top
      -1, 1, -1, 1,
      1, 1, -1, 1,
      1, 1, 1, 1,
      -1, 1, 1, 1,
      // bottom
      -1, -1, -1, 1,
      1, -1, -1, 1,
      1, -1, 1, 1,
      -1, -1, 1, 1
    );
  }

  constructor(branchCol: vec4, leafCol: vec4, iter: number) {
    this.turtleIndices = [];
    this.turtleNormals = [];
    this.turtlePositions = [];
    this.constructBaseINP();

    this.translate = mat4.create();
    this.rotate = mat4.create();
    this.scale = mat4.create();


    this.turtleStack = [];
    this.turtleStack.push(new TurtleState(vec3.fromValues(0,0,0), quat.create(), 0));

    this.turtleState = new TurtleState(vec3.fromValues(0,-2,0), quat.create(), 0);
    

    this.branchCol = branchCol;
    this.leafCol = leafCol;

    this.iterations = iter;

  }

  applyMatrix(city: City, transform: mat4, isLeaf: boolean) {
    let turtleIdx = this.turtleIndices.length;
    let cityIdxLength = city.cityIndices.length;
    let idxNum = city.cityIndices[cityIdxLength - 1];
    if (cityIdxLength === 0) {
      idxNum = -1;
    }
    for (let i = 0; i < turtleIdx; i++) {
      let j = this.turtleIndices[i] + idxNum + 1;
      city.cityIndices.push(j);
    }

    let invTransT = mat4.create();
    mat4.transpose(invTransT, transform);
    mat4.invert(invTransT, invTransT);

    // transform normals and append
    for (let i = 0; i < this.turtleNormals.length - 1; i+=4) {
      let x = this.turtleNormals[i];
      let y = this.turtleNormals[i + 1];
      let z = this.turtleNormals[i + 2];
      let w = this.turtleNormals[i + 3];
      let nor = vec4.fromValues(x, y, z, w);
      vec4.transformMat4(nor, nor, invTransT);
      city.cityNormals.push(nor[0]);
      city.cityNormals.push(nor[1]);
      city.cityNormals.push(nor[2]);
      city.cityNormals.push(nor[3]);
    }

    // transform positions according to matrix and append
    for (let i = 0; i < this.turtlePositions.length - 1; i+=4) {
      let x = this.turtlePositions[i];
      let y = this.turtlePositions[i + 1];
      let z = this.turtlePositions[i + 2];
      let w = this.turtlePositions[i + 3];
      let pos = vec4.fromValues(x, y, z, w);
      vec4.transformMat4(pos, pos, transform);
      city.cityPositions.push(pos[0]);
      city.cityPositions.push(pos[1]);
      city.cityPositions.push(pos[2]);
      city.cityPositions.push(pos[3]);
    }
    let color = vec4.create();
  
    if (!isLeaf) {
      color = this.branchCol;
    } else {
      color = this.leafCol
    }

    for (let i = 0; i < this.turtlePositions.length - 1; i+=4) {
      city.cityColors.push(color[0], color[1], color[2], color[3]);
    }
  }

  getMatrix(position: vec3) {
    let transform : mat4 = mat4.create();

    let transformLocal : mat4 = mat4.create();
    mat4.fromTranslation(transformLocal, position);
    
    mat4.fromScaling(this.scale, vec3.fromValues(1,1,1));    
    mat4.fromQuat(this.rotate, this.turtleStack[this.turtleStack.length - 1].q);
    mat4.fromTranslation(this.translate, this.turtleStack[this.turtleStack.length - 1].position);
    mat4.multiply(transform, this.translate, this.rotate);
    mat4.multiply(transform, transform, this.scale);

    mat4.multiply(transform, transform, transformLocal);

    return transform;
  }

  getRotation() {
    mat4.fromQuat(this.rotate, this.turtleStack[this.turtleStack.length - 1].q);
    return this.rotate;
  }

  // after drawing a branch, update the turtlestate
  updateTurtlePosition(localPos : vec4) {
    vec4.transformMat4(localPos, localPos, this.getRotation());
    let worldPos = this.turtleStack[this.turtleStack.length - 1].position;
    vec4.add(localPos, localPos, [worldPos[0], worldPos[1], worldPos[2]]);
    this.turtleStack[this.turtleStack.length - 1].position = 
      vec3.fromValues(localPos[0], localPos[1], localPos[2]);
  }

  draw(city: City, string: string, position: vec3) {
    for (let x = 0; x < string.length; x++) {
      let currChar = string.charAt(x);
      let topTurtle = this.turtleStack[this.turtleStack.length - 1];
    
      if (currChar == "A") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0,1,0]);

        let transform = this.getMatrix(position);
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(city, transform, true);

        // update turtlestate position
        let pos = vec4.fromValues(0,2,0,1);
        this.updateTurtlePosition(pos);
        
      } else if (currChar == "B") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0.9,1,0]);

        let localScale = mat4.create();
        mat4.fromScaling(localScale, [0.1,1,1]);

        mat4.multiply(transformLocal, transformLocal, localScale);
        let transform1 = this.getMatrix(position);
        let transform = transform1;
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(city, transform, true);

        mat4.fromTranslation(transformLocal,[-0.9,1,0]);
        mat4.multiply(transformLocal, transformLocal, localScale);
        mat4.multiply(transform, this.getMatrix(position), transformLocal);
        this.applyMatrix(city, transform, true);

        // update turtlestate position
        let pos = vec4.fromValues(0,2,0,1);
        this.updateTurtlePosition(pos);
      } else if (currChar == "C") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0,1,0.9]);

        let localScale = mat4.create();
        mat4.fromScaling(localScale, [1,1,0.1]);

        mat4.multiply(transformLocal, transformLocal, localScale);
        let transform1 = this.getMatrix(position);
        let transform = transform1;
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(city, transform, true);

        mat4.fromTranslation(transformLocal,[0,1,-0.9]);
        mat4.multiply(transformLocal, transformLocal, localScale);
        mat4.multiply(transform, this.getMatrix(position), transformLocal);
        this.applyMatrix(city, transform, true);

        // update turtlestate position
        let pos = vec4.fromValues(0,2,0,1);
        this.updateTurtlePosition(pos);
      } else if (currChar == "D") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0.9,1,0.9]);

        let localScale = mat4.create();
        mat4.fromScaling(localScale, [0.1,1,0.1]);

        mat4.multiply(transformLocal, transformLocal, localScale);
        let transform1 = this.getMatrix(position);
        let transform = transform1;
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(city, transform, true);

        mat4.fromTranslation(transformLocal,[-0.9,1,-0.9]);
        mat4.multiply(transformLocal, transformLocal, localScale);
        mat4.multiply(transform, this.getMatrix(position), transformLocal);
        this.applyMatrix(city, transform, true);

        // update turtlestate position
        let pos = vec4.fromValues(0,2,0,1);
        this.updateTurtlePosition(pos);
      }
    }
    
    this.turtleStack[this.turtleStack.length - 1].position = 
      vec3.fromValues(0,0,0);
  }

  drawFloor(city: City) {
    let transformLocal = mat4.create();
    mat4.fromTranslation(transformLocal,[0,-0.1,0]);

    let localScale = mat4.create();
    mat4.fromScaling(localScale, [100,0.1,100]);

    mat4.multiply(transformLocal, transformLocal, localScale);
    let transform = this.getMatrix(vec3.fromValues(0,0,0));
    mat4.multiply(transform, transform, transformLocal);
    // this.applyMatrix(city, transform, true);

    let color = this.branchCol;
    city.cityColors.push(color[0], color[1], color[2], color[3]);
    city.cityColors.push(color[0], color[1], color[2], color[3]);
    city.cityColors.push(color[0], color[1], color[2], color[3]);
    city.cityColors.push(color[0], color[1], color[2], color[3]);

    let W = 100;
    
    city.cityPositions.push( W, 0, W,1);
    city.cityPositions.push(-W, 0, W,1);
    city.cityPositions.push(-W, 0,-W,1);
    city.cityPositions.push( W, 0,-W,1);

    city.cityNormals.push(0,1,0,0);
    city.cityNormals.push(0,1,0,0);
    city.cityNormals.push(0,1,0,0);
    city.cityNormals.push(0,1,0,0);

    city.cityIndices.push(0,1,2,0,2,3);
    
  }

};

export default Turtle;

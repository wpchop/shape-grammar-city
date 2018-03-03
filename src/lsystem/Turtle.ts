import {vec3, vec4, mat4, quat} from 'gl-matrix';
import Plant from '../geometry/Plant';

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
    this.turtleStack.push(new TurtleState(vec3.fromValues(0,-2,0), quat.create(), 0));

    this.branchCol = branchCol;
    this.leafCol = leafCol;

    this.iterations = iter;

  }

  applyMatrix(plant: Plant, transform: mat4, isLeaf: boolean) {
    let turtleIdx = this.turtleIndices.length;
    let plantIdxLength = plant.plantIndices.length;
    let idxNum = plant.plantIndices[plantIdxLength - 1];
    if (plantIdxLength === 0) {
      idxNum = -1;
    }
    for (let i = 0; i < turtleIdx; i++) {
      let j = this.turtleIndices[i] + idxNum + 1;
      plant.plantIndices.push(j);
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
      plant.plantNormals.push(nor[0]);
      plant.plantNormals.push(nor[1]);
      plant.plantNormals.push(nor[2]);
      plant.plantNormals.push(nor[3]);
    }

    // transform positions according to matrix and append
    for (let i = 0; i < this.turtlePositions.length - 1; i+=4) {
      let x = this.turtlePositions[i];
      let y = this.turtlePositions[i + 1];
      let z = this.turtlePositions[i + 2];
      let w = this.turtlePositions[i + 3];
      let pos = vec4.fromValues(x, y, z, w);
      vec4.transformMat4(pos, pos, transform);
      plant.plantPositions.push(pos[0]);
      plant.plantPositions.push(pos[1]);
      plant.plantPositions.push(pos[2]);
      plant.plantPositions.push(pos[3]);
    }
    let color = vec4.create();
  
    if (!isLeaf) {
      color = this.branchCol;
    } else {
      color = this.leafCol
    }

    for (let i = 0; i < this.turtlePositions.length - 1; i+=4) {
      plant.plantColors.push(color[0], color[1], color[2], color[3]);
    }
  }

  getMatrix() {
    let transform : mat4 = mat4.create();

    mat4.fromScaling(this.scale, vec3.fromValues(0.05 / this.iterations, 0.5 / this.iterations,0.05/ this.iterations));
    mat4.fromQuat(this.rotate, this.turtleStack[this.turtleStack.length - 1].q);
    mat4.fromTranslation(this.translate, this.turtleStack[this.turtleStack.length - 1].position);
    mat4.multiply(transform, this.translate, this.rotate);
    mat4.multiply(transform, transform, this.scale);

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

  draw(plant: Plant, string: string) {
    for (let x = 0; x < string.length; x++) {
      let currChar = string.charAt(x);
      let topTurtle = this.turtleStack[this.turtleStack.length - 1];
      if (currChar == "A") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0,1,0]);

        let transform = this.getMatrix();
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(plant, transform, true);

        // update turtlestate position
        let pos = vec4.fromValues(0,1 / this.iterations,0,1);
        this.updateTurtlePosition(pos);
        
      } else if (currChar == "B") {
        let transformLocal = mat4.create();
        mat4.fromTranslation(transformLocal,[0,1,0]);

        let transform = this.getMatrix();
        mat4.multiply(transform, transform, transformLocal);
        this.applyMatrix(plant, transform, false);

        // update turtlestate position to end of branch
        let pos = vec4.fromValues(0,1 / this.iterations,0,1);
        this.updateTurtlePosition(pos);
      } else if (currChar == "[") {
        let pos = topTurtle.position;
        let depth = topTurtle.depth + 1;
        let q = topTurtle.q;
        let q2 = quat.create();
        let rn = Math.random() * 25 + 35;
        let rn2 = Math.random() * 10;
        let rny = Math.random() * 180;
        quat.fromEuler(q2, rn2, rny, rn);
        quat.multiply(q2, q, q2);
        let turt = new TurtleState(pos, q2, depth);
        this.turtleStack.push(turt);
      } else if (currChar == "]") {
        this.turtleStack.pop();
        let q = this.turtleStack[this.turtleStack.length - 1].q;
        let q2 = quat.create();
        let rn = Math.random() * 25 + 35;
        let rn2 = Math.random() * 10;
        let rny = Math.random() * 180;
        quat.fromEuler(q2, rn2, -rny, -rn);
        quat.multiply(q2, q, q2);

        this.turtleStack[this.turtleStack.length - 1].q = q2;
      }
    }
  }

};

export default Turtle;

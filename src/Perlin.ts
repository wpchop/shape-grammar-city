export class Perlin {
    constructor() {}

    Noise(x : number, y : number) {
        let n : number = x + y * 57;
        n = (n<<13) ^ n;
        let noise = ( 1 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824);
        noise = (noise + 1) / 2;
        return noise;
    }
    
    LinearInterpolate(a :number, b :number, x: number) {
        return (a * (1.0 - x)) + b * x;
    }
    
    SmoothNoise(x :number, y: number) {
        let corners : number = 
            (this.Noise(x - 1.0, y - 1.0) + 
            this.Noise(x + 1.0, y - 1.0) + 
            this.Noise(x - 1.0, y + 1.0) + 
            this.Noise(x + 1.0, y + 1.0)) / 16.0;
        let sides : number = (this.Noise(x - 1.0, y) + 
            this.Noise(x + 1.0, y) + 
            this.Noise(x, y - 1.0) + 
            this.Noise(x, y + 1.0)) / 8.0;
        let center = this.Noise(x, y) / 4.0;
        return corners + sides + center;
    }
    
    InterpolateNoise( x: number, y: number) {
        let integer_X = Math.floor(x);
        let fractional_X = Math.abs(x - integer_X);
        let integer_Y = Math.floor(y);
        let fractional_Y = Math.abs(y - integer_Y);
    
        let v1 = this.SmoothNoise(integer_X, integer_Y);
        let v2 = this.SmoothNoise(integer_X + 1.0, integer_Y);
        let v3 = this.SmoothNoise(integer_X, integer_Y + 1.0);
        let v4 = this.SmoothNoise(integer_X + 1.0, integer_Y + 1.0);
    
        let i1 = this.LinearInterpolate(v1, v2, fractional_X);
        let i2 = this.LinearInterpolate(v3, v4, fractional_X);
    
        return this.LinearInterpolate(i1, i2, fractional_Y);
    }
    
    PerlinNoise(x : number, y: number, c: number) {
        x = x * c;
        y = y * c;
        let total = 0.0;
        let p = 0.5;
        // number of octaves
        let n = 6;
        let max = 1.4;
    
        for (let i = 0; i < n; i++) {
            let frequency = Math.pow(2.0, i);
            let amplitude = Math.pow(p, i);
    
            total = total + this.InterpolateNoise(x * frequency, y * frequency) * amplitude;
        }
        return (total/max);
    }
}

export default Perlin;
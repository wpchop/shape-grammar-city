# shape-grammar-city

#### CIS566 Homework 5: Shape Grammar City

#### Wenli Zhao
#### wenliz

[demo](https://wpchop.github.io/shape-grammar-city/)

#### Approach
I started with my [l-system](https://github.com/wpchop/homework-4-l-systems-wpchop) code and started modifying the way the axioms were constructed and drawn. I added new rules that I defined for my own building. Each building starts off with an empty string, and a map of proabilities for each additional level. There were 5 rule-mappings. For each possible previous level, I had a map to the subsequent levels with a map of probabilities. I would generate axioms of different lengths, and this corresponded to how high the building would be.
To draw the rules, I would draw the building based on the characters. A was a solid floor, B and C corresponded to two walls, D corresponded to two thin columns. 

In order to generate the city layout, I started with a grid, but scaled the x and z dimensions of the buildings arbitrarily. I also created my own density function to scale the height of the buildings (e.g., the length of the axiom) that was a combination of tweaking perlin noise and a series of step functions that increased the height of buildings closer to the center of the city (like Philly!!) The colors are also dependent on the density function, with some randomness added in. 

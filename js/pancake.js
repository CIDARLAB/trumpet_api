// This object prototype contains an instance of the invertSim object prototype. 
// It is a special type of InvertSim which uses the "Pancake" Algorithm to place 
// invertases in particular positions between parts, such that every permutation 
// of parts has at least one invertase key.

// Creates a Pancake invertase design given the number of parts in the
// design.
//
// @param n - The number of parts
// @param comb - Whether the object discerns between inverted and non-ineverted parts
function pancake(n, comb) {
	this.invSim = new invertSim();

    // initialize the bitMapArray for this object
    this.invSim.flipBitMap = [];
    var i;
    for (i = 0; i < n; i++) {
        this.invSim.flipBitMap[i] = 0;
    }

    // boolean which describes wether inverted parts are recognized separately
    // from non-inverted parts
    this.invSim.combos = comb;

    // create integer currentPer which keeps track of the permutation of parts
    // by their integer value
    this.invSim.currentPerm = [];

    // create the actual LinkSort Design
    this.createDesign(n);

    // define the parts array
    for (i = 0; i < this.invSim.designArray.length; i++) {
        if (this.invSim.designArray[i].charAt(0) !== "I") {
            this.invSim.addPart(this.invSim.designArray[i]);
        }
    }

    //initialize partPermutations with all possible part Permutations
    this.invSim.partPermutations = [];

    // now that the object has been made, set the original design field before
    // the design array is changed
    this.invSim.setOriginalDesign(this.invSim.designString());

    // Creates the actual design given the number of parts, n. It also sets
    // the invertSim design array to this generated design.
   	// 
    // @param n - Number of parts
    this.createDesign = function(n) {
        // this will hold the entire design string
        var design = "";
        // create the variables we will need
        var constructPrefix = [];
        var partPrefix = [];
        var partSuffix = [];
        var parts = [];
        // initialize these array lists
        var i;
        for (i = 0; i < n; i++) {
            partPrefix[i] = "";
            partSuffix[i] = "";
        }
        // create the construct prefix
        for (i = 1; i < 4*n*n - 6*n; i+=2) {
            constructPrefix[i] = "I" + i + " ";
        }
        var currentInvNum = 1;
        var invsToAdd = "";
        // create each part's suffix'
        var j;
        for (i = 0; i < 2*n - 3; i++) {
            for (j = 0; j < n; j++) {
            	currentInvNum++;
                invsToAdd = "I" + currentInvNum + "' I";
                currentInvNum++;
                invsToAdd = invsToAdd + currentInvNum + "' ";
                partSuffix[j] = partSuffix[j].concat(invsToAdd);
            }
        }
        // create each part's prefix
        currentInvNum--;
        for ( i = 0; i < 2*n - 3; i++) {
            for (j = n; j >= 1; j--) {
                partPrefix[j - 1] = partPrefix[j - 1].concat("I" + currentInvNum + " ");
                currentInvNum = currentInvNum - 2;
            }
        }
        // create the parts
        for (i = 1; i <= n; i++) {
            parts[i] = "P" + i + " ";
        }
        // assemble the whole design
        // start with the construct prefix
        for (i = 0; i < constructPrefix.length; i++) {
            design = design.concat(constructPrefix[i]);
        }
        // reset current inv for combos
        currentInvNum = 4*n*n - 6*n + 1;
        // now add each parts prefix, part, and suffix
        for (i = 0; i < n; i++) {
            design = design.concat(partPrefix[i]);
            if (combos) {
                design = design.concat("I" + currentInvNum + " ");
            }
            design = design.concat(parts[i]);
            if (combos) {
            	currentInvNum++;
                design = design.concat("I" + currentInvNum + "' ");
            }
            design = design.concat(partSuffix[i]);
        }
        this.invSim.setDesignArray(design);
    };

    // Generates the necessary invertase key for obtaining the specified
    // permutation. This key always describes how to get to the desired target
    // from the ORIGINAL DESIGN!
    //
    // @param target - target permutation (For example, "P1 P3 P2'")
    this.generateKey = function(target) {
        // string of invertase numbers that will be delivered to the user
        var invertaseKey = "";
        var targetStringPerm = target.split(" ");
		var targetPerm = [];
        // check the targetPerm and set the integer representation of this
        // permutation
        try {
            targetPerm = this.invSim.getIntPartPerm(targetStringPerm);
        }
        catch (err) {
            console.log(err);
        }
        // create the sorted configuration
        var sortedConfig = [];
        var i;
        for (i = 0; i < targetPerm; i++) {
        	sortedConfig[i] = targetPerm[i];
        }
        sortedConfig.sort(function(a, b) {
            return a - b;
        });
        // record the design of the object
        var oldDesign = this.invSim.designString();
        this.setDesignArray(this.getOriginalDesign());
        var targetValue = 0;
        var currentValue = 0;
        var index = -1;
        var tempInvertase = -1;
        var n = this.invSim.getNumberOfParts();
        var usedLayer = false;
        // there are 2*n - 3 possible flips
        var layer = 2*n - 3;
        // there are n - 1 sets, start at the last place, since this will be the
        // target index
        for (i = n - 1; i > 0; i--) {
            usedLayer = false;
            targetValue = targetPerm[i];
            currentValue = currentPerm[i];
            if (currentValue != targetValue) {
                // if the target value is not at the beginning, bring it there
                if (targetValue != this.invSim.currentPerm[0]) {
                    // flip the target value to the front
                    usedLayer = true;
                    // first check if the value's bit map is flipped
                    if (this.invSim.getBitMapValue(targetValue - 1) == 1) {
                        // if it has been flipped, then flip it's construct\
                        tempInvertase = layer*n*2 - 2*(n - targetValue);
                        // add this to the invertase key
                        invertaseKey = invertaseKey.concat(tempInvertase + " ");
                        // make the flip
                        if (this.invSim.isInversionPossible(JSON.stringify(tempInvertase))) {
                            this.invSim.invert();
                        }
                    }
                    // now that the part is oriented correctly, flip it to the front
                    // first calculate the invertase for doing so
                    tempInvertase = layer*n*2 - 2*(n - targetValue) - 1;
                    // add this to the key
                    invertaseKey = invertaseKey.concat(tempInvertase + " ");
                    // make the flip
                    if (this.invSim.isInversionPossible(JSON.stringify(tempInvertase))) {
                        this.invSim.invert();
                    }
                }
                // now that the part is at the beginning of the current perm
                if (usedLayer) {
                    // substract a layer
                    layer = layer -1;
                }
                // find the value at the i index , since this is the value we will
                // use to flip, store this in currentValue
                currentValue = currentPerm[i];
                // calculate the invertase for this flip
                // first check if the part is flipped again
                if (this.invSim.getBitMapValue(currentValue - 1) == 1) {
                    // if it has been flipped, then flip it's construct
                    tempInvertase = layer*n*2 - 2*(n-currentValue);
                    // add this to the invertase key
                    invertaseKey = invertaseKey.concat(tempInvertase + " ");
                    // make the flip
                    if (this.invSim.isInversionPossible(JSON.stringify(tempInvertase))) {
                        this.invSim.invert();
                    }
                }
                // now that the part is oriented correctly, flip it to the i position
                // first calculate the invertase for doing so
                tempInvertase = layer*n*2 - 2*(n - currentValue) - 1;
                // add this to the key
                invertaseKey = invertaseKey.concat(tempInvertase + " ");
                // make the flip
                if (this.invSim.isInversionPossible(JSON.stringify(tempInvertase))) {
                    this.invSim.invert();
                }
            }
            if (!usedLayer) {
                layer = layer - 2;
            } else {
                // subtract from the layer every again
                layer = layer - 1;
            }
        }
        // if the object discerns between inverted and non-inverted parts, then
        // make sure the parts are in the correct orientation
        if (combos) {
            // used for determining the index for flipping a part in the next loop
            var primedIndex = 0;
            //finally, add any extra inversions to invert parts only
            for (i = 0; i < n; i++) {
                // if the part should be primed
                if (targetStringPerm[i].charAt(targetStringPerm[i].length - 1) === "'") {
                    // get the index
                    primedIndex = parseInt(targetStringPerm[i].substring(1, targetStringPerm[i].length - 1)) - 1;
                    // but the part is not primed
                    if (this.invSim.getBitMapValue(primedIndex) == 0) {
                        // add invertase to flip the part
                        tempInvertase = 4*n*n - 6*n + primedIndex + 1;
                        invertaseKey = invertaseKey.concat(JSON.stringify(tempInvertase) + " ");
                    }
                }
                // if the part should not be primed
                else {
                    // again get the part index
                    primedIndex = parseInt(targetStringPerm[i].substring(1, targetStringPerm[i].length)) - 1;
                    // check if the part is primed yet
                    if (this.invSim.getBitMapValue(primedIndex) == 1) {
                        // add invertase to flip the part
                        tempInvertase = 4*n*n - 6*n + primedIndex + 1;
                        invertaseKey = invertaseKey.concat(JSON.stringify(tempInvertase) + " ");
                    }
                }
            }
        }
        // reset the original design
        this.invSim.setDesignArray(oldDesign);
        // return the final key
        return invertaseKey;
    };

    // Returns the algorithm used to create the design array for this InvertSim.
    this.getAlgorithm = function() {
        return "Pancake";
    };

    // Creates a "fresh" copy of this InvertSim object.  The returned Pancake
    // object has the original design as it's current design array.
    // 
    // @return
    this.cloneFresh = function() {
        return new pancake(this.invSim.getNumberOfParts(), this.invSim.isCombos());
    };
}
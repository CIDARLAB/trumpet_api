(function() {
	var InvertSim = function() {
		// keeps track of the sites being used to make an inversion
		// set the current sites
		this.currentSites = [-1 -1];

		// based on the current sites, evaluates whether an inversion is possible
		// set isPossible
		this.isPossible = false;

		// stores entire design
		this.designArray;

		// stores only parts which must be represented as P
		// define the parts array
		this.parts = [];

		// bit map representation of which parts are currently flipped
		this.flipBitMap;

		// retains the current permutation of parts by their integer representation
		this.currentPerm;

		// array list containing all part permutations
		this.partPermutations;

		// specifies whether this InvertSim object distinguishes between inverted and non-inverted parts
		this.combos;

		// the original design of any algorithm before it is tailored
	    // stored for key generation purposes
		this.originalDesign;

		// all part permutations are not generated initially because this can be time consuming
	    // this field indicates whether they have been calculated yet
		this.isPermsGenerated = false;
	};

	/*
    Checks whether it is possible to make an inversion, given the input
    invertase string. If it is possible, this method sets the currentSites
    values necessary for making the inversion using the invert() method.
    If it is impossible, this method returns false.

    @param invertase
    */
	InvertSim.prototype.isInversionPossible = function(invertase) {
		// defines the strings we search for
        var openInv = "I" + invertase;
        var closeInv = "I" + invertase + "'";

        // go through design String array and search for the invertase
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            // if the design contains either string then store that info
           if (this.designArray[i] === openInv) {
               this.currentSites[0] = i;
           }
           if (this.designArray[i] === closeInv) {
               this.currentSites[1] = i;
           }
        }

        // if either of the sites are still -1 then the switch cannot be made
        if (this.currentSites[0] != -1 && this.currentSites[1] != -1) {
            this.isPossible = true;
        }
        // if not, return false and reset the current sites
        else {
            this.isPossible = false;
            this.currentSites[0] = -1;
            this.currentSites[1] = -1;
        }

        // return whether the switch can be made
        return this.isPossible;
	};

	/*
    Once the current sites are set using the isPossible method, call this
    method to make the actual inversion using those sites
    */
	InvertSim.prototype.invert = function() {
		// distinguish between the two cases (FORWARD AND REVERSE)
        if (this.currentSites[1] < this.currentSites[0]) {
            var tempSite = this.currentSites[0];
            this.currentSites[0] = this.currentSites[1];
            this.currentSites[1] = tempSite;
        }

        // complement parts
        var i;
        var index;
        for (i = this.currentSites[0]; i <= this.currentSites[1]; i++) {
            // check for inversion of part
            if (this.designArray[i].charAt(this.designArray[i].length - 1) === "'") {
                // if a part is encountered, flip its bit map value
                if (this.designArray[i].charAt(0) === "P") {
                    index = parseInt(this.designArray[i].substring(1, this.designArray[i].length - 1)) - 1;
                    this.setBitMap(index);
                }
                this.designArray[i] = this.designArray[i].substring(0, this.designArray[i].length - 1);
            }
            // not already inverted, then invert the part
            else {
                // if a part is encountered, flip its bit map value
                if (this.designArray[i].charAt(0) === "P") {
                    index = parseInt(this.designArray[i].substring(1, this.designArray[i].length)) - 1;
                    this.setBitMap(index);
                }
                this.designArray[i] = this.designArray[i] + "'";
            }
        }

        // temporary array used for reversing our original array
        var tempArray = [];

        // invert parts
        for (i = 0; i <= this.currentSites[1] - this.currentSites[0]; i++) {
            tempArray[i] = this.designArray[this.currentSites[1] - i];
        }

        // now replace the original with temps
        for (i = 0; i <= this.currentSites[1] - this.currentSites[0]; i++) {
            this.designArray[this.currentSites[0] + i] = tempArray[i];
        }

        // now reset the current sites
        this.currentSites[0] = -1;
        this.currentSites[1] = -1;

        // reset isPossible
        this.isPossible = false;

        // now that the flip has been made, set the current part permutation
        // field for the object
        this.setCurrentPerm();
	};

	/*
    Returns the table of invertase keys for the permutations specified. It
    also shortens the design and keeps only the necessary invertases. The
    invertases which are kept are renumbered accordingly.
    
    @param permutations - a list of permutations which should be achieved
    @return
    */
	InvertSim.prototype.tailorDesign = function(permutations) {
		var tailoredKeyTable = this.generateTailoredKeyTable(permutations);

        // now we know which invertases we need to keep, we can delete all the other invertases
        this.removeInvertases(tailoredKeyTable);
        return tailoredKeyTable;
	};

	/*
    Removes all invertases from the design except for the invertases provided
    in the second column of the table.
    
    @param tailoredKeyTabel - Table of permutations and invertase keys
    */
	InvertSim.prototype.removeInvertases = function(tailoredKeyTable) {
		var uniqueInvertases = [];

        // loop through the tailored key table's second column and get all unique invertases
        var key;
        var i, j;
        for (i = 1; i < tailoredKeyTable.length; i++) {
            key = tailoredKeyTable[i][1].split(" ");
            for (j = 0; j < key.length; j++) {
                if (uniqueInvertases.indexOf(key[j]) < 0) {
                    uniqueInvertases.push(key[j]);
                }
            }
        }

        // get the original design
        var originalDesignArray = this.getDesignArray();

        // copy the original into an array list
        var shortenedDesign = [];
        shortenedDesign = shortenedDesign.concat(originalDesignArray);

        // string used to store each component in the design as we check the comp.
        var tempComponent = "";

        // string which keeps track of the unique invertase we are checking for
        var tempInv = "";

        // determines whether the element should be deleted
        var deleteInv = true;

        // loop through the invertases that we want to keep
        for (i = 0; i < shortenedDesign.length; i++) {
            // get the design component
            tempComponent = shortenedDesign[i];

            // if an invertase is encountered
            if (tempComponent.charAt(0) === "I") {
                // loop through the unique invertases and test the temp component
                // against each one
                for (j = 0; j < uniqueInvertases.length; j++) {
                    // create the invertase string we want to check for
                    tempInv = uniqueInvertases[j];

                    // don't delete the element if it belongs to the set we are keeping
                    if (tempComponent === "I" + tempInv) {
                        deleteInv = false;
                    }
                    if (tempComponent === "I" + tempInv + "'") {
                        deleteInv = false;
                    }
                }

                // if the element should be deleted, set that element to null
                if (deleteInv) {
                    shortenedDesign[i] = null;
                }

                // reset the boolean for the next element
                deleteInv = true;
            }
        }

        // fixedDesign will be delivered to the user
        var fixedDesign = "";

        // eliminate elements which were set to null
        for (i = 0; i < shortenedDesign.length; i++) {
            if (shortenedDesign[i] != null) {
                fixedDesign = fixedDesign + shortenedDesign[i] + " ");
            }
        }
        this.setDesignArray(fixedDesign);
	};

	/*
    Returns a key table which includes the listings for only the permutations
    specified.
    
    @param permutations
    @return
    */
	InvertSim.prototype.generateTailoredKeyTable = function(permutations) {
		// the +1 accounts for the starting permutation
        var length = permutations.length + 1;
        var tailoredKeyTable = [];
        var i;
        for (i = 0; i < length; i++) {
            tailoredKeyTable[i] = [];
        }
        tailoredKeyTable[0][0] = this.partsString();
        tailoredKeyTable[0][1] = "Starting Construct";
        for (i = 1; i < length; i++) {
            tailoredKeyTable[i][0] = permutations[i - 1];
            tailoredKeyTable[i][1] = this.generateKey(permutations[i - 1]);
        }
        var c = this.designString();
        if (c === this.getOriginalDesign()) {
            return tailoredKeyTable;
        } else {
            // remove the beginning piece of each key
            // first get the construct key
            var constructKeyString = this.generateKey(this.partsString());
            var constructKey = constructKeyString.split(" ");
            var key;
            var editedKey;
            for (i = 1; i < length; i++) {
                key = tailoredKeyTable[i][1].split(" ");
                editedKey = "";
                var j;
                for (j = 0; j < constructKey.length; j++) {
                    key[j] = null;
                }
                for (j = 0; j < key.length; j++) {
                    if (key[j] != null) {
                        editedKey = editedKey + key[j] + " ";
                    }
                }

                // finally replace the original with the edited
                tailoredKeyTable[i][1] = editedKey;
            }
            return tailoredKeyTable;
        }
	};

	/*
    Generates entire table of keys. Each entry has two columns. The first
    is the permutation of parts. The second is the invertase key which leads
    to that permutation.

    @return
    */
	InvertSim.prototype.generateKeyTable = function() {
		var length = this.partPermutations.length;
        var keyTable = [];
        var i;
        for (i = 0; i < length; i++) {
            tailoredKeyTable[i] = [];
        }
        for (i = 0; i < length; i++) {
            keyTable[i][0] = this.partPermutations[i];
            keyTable[i][1] = this.generateKey(this.partPermutations[i]);
        }
        return keyTable;
	};

	/*
    This bare bones permutation algorithm spits out all permutations of any
    ArrayList of type string. It is currently set to also call the generate
    subPerms so as to include all permutations of parts.

    @param inputArray
    @param next
    */
	InvertSim.prototype.generatePartPermutations = function(inputArray, next) {
		// base case
        if (inputArray.length == 0) {
            // add the current permutation
            this.partPermutations.push(next);

            // if we want all of the extra combinations
            if (combos) {
                this.generateSubPerms(next);
            }

            // always return
            return;
        }
        // general case
        else {
            var i;
            var copy;
            var temp;
            for (i = 0; i < inputArray.length; i++) {
               // make a copy because strings are passed by reference
               copy = next + inputArray[i] + " ";

               // make another copy
               temp = inputArray[i];

               // remove the element
               inputArray.splice(i, 1);

               // recursively call the permutation function again
               this.generatePartPermutations(inputArray, copy);

               // add the element back
               inputArray.splice(i, 0, temp);
            }
        }
	};

	/*
    Adds all sub-permutations of the current part permutation. This distinguishes
    between a permutation with complements and a permutation without
    complements.

    @param next
    */
	InvertSim.prototype.generateSubPerms = function(next) {
		// parse the string
        var currentPartPerm = next.split(" ");

        // use the length
        var n = currentPartPerm.length;
        var newPerm = "";
        var bitRep = [];
        var sizeOfBitMap = Math.pow(2, n);

        // take that permutation and find each sub-permutation
        var i, j;
        for (i = 1; i < sizeOfBitMap; i++) {
            bitRep = this.intToBitRep(i, n);
            for (j = 0; j < n; j++) {
                if (bitRep[j] == 1) {
                    newPerm = newPerm + currentPartPerm[j] + "' ";
                } else {
                    newPerm = newPerm + currentPartPerm[j] + " ";
                }
            }
            this.partPermutations.push(newPerm);
            newPerm = "";
        }
	};

	/*
    Converts a decimal number to it's binary representations. NumberOfBits
    specifies how many bits long the return integer array representation will be.

    @param decimalInt
    @param numberOfBits
    @return
    */
	InvertSim.prototype.intToBitRep = function(decimalInt, numberOfBits) {
		var bitRep = [];
        var bitMask = 1;
        var value = 0;
        var i;
        for (i = 0; i < numberOfBits; i++) {
            // output of the bitmask
            value = decimalInt & bitMask;

            // if the value is not 0, then append a 1
            if (value != 0) {
                bitRep[i] = 1;
            // if the value is a 0, then append a 0
            } else if (value == 0) {
                bitRep[i] = 0;
            }
            bitMask = bitMask*2;
        }
        return bitRep;
	};

	/*
    Checks whether the integer representation of the part permutation
    contains all of the correct elements, and each element only once.

    @param permutation
    @throws PermutationException
    */
	InvertSim.prototype.checkPermutation = function(permutation) {
		var n = permutation.length;
        var check = [];

        // loop through each element of check
        var i;
        for (i = 0; i < n; i++) {
            if (check.indexOf(permutation[i]) < 0) {
                check.push(permutation[i]);
            }
        }

        // check if the integer permutation contains duplicates
        if (check.length != n) {
            throw "Permutation does not make sense!";
        }

        // sort the array
        check.sort(function(a, b) {
            return a - b;
        });

        // check that elements are not repeated
        for (i = 0; i < n; i++) {
            if (check[i] != (i + 1)) {
                throw "Permutation does not make sense!";
            }
        }
	};

	/**
    Allows InvertSim extensions to access the parts list when creating a
    design.

    @param part
    */
	InvertSim.prototype.addPart = function(part) {
		this.parts.push(part);
	};

	/*
    Sets the current part permutation. This should only be called from
    invert().
    */
	InvertSim.prototype.setCurrentPerm = function() {
		var currentPartConfiguration = this.getPartPerm();
        var tempPartPerm = currentPartConfiguration.split(" ");
        var currentPart = "";
        var i;
        for (i = 0; i < tempPartPerm.length; i++) {
            currentPart = tempPartPerm[i];
            this.currentPerm[i] = parseInt(currentPart.substring(1, currentPart.length));
        }
	};

	/**
    Sets the bit of index i. If the bit is 0, then it is set to 1. If the
    bit is 1, then it is set to 0.

    @param i Index of the bit map that will be flipped.
    */
	InvertSim.prototype.setBitMap = function(i) {
		if (this.flipBitMap[i] == 0) {
            this.flipBitMap[i] = 1;
        } else {
            this.flipBitMap[i] = 0;
        }
	};

	/*
    Takes a string input, with each part separated by spaces
    splits this string and sets it to the current design array

    @param design
    */
	InvertSim.prototype.setDesignArray = function(design) {
		this.designArray = design.split(" ");
        this.clearBitMap();
        this.setCurrentPerm();
	};

	/*
    Allows extensions of InvertSim to specify the original design.

    @param design
    */
	InvertSim.prototype.setOriginalDesign = function(design) {
		this.originalDesign = design;
	};

	/*
    Sets all values of the Flip Bit Map to 0. Used at the end of the key
    generator.
    */
	InvertSim.prototype.clearBitMap = function() {
		var i;
        for (i = 0; i < this.flipBitMap.length; i++) {
            this.flipBitMap[i] = 0;
        }
	};

	/*
    Returns a list of all invertases within the current design array.

    @return
    */
	InvertSim.prototype.getInvertases = function() {
		var invertases = [];
        var inv = "";
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            if (this.designArray[i].charAt(0) === "I") {
                if (this.designArray[i].charAt(this.designArray[i].length - 1) === "'") {
                    inv = this.designArray[i].substring(0, this.designArray[i].length - 1);
                } else {
                    inv = this.designArray[i].substring(0, this.designArray[i].length);
                }
                if (invertases.indexOf(inv) < 0) {
                    invertases.push(inv);
                }
            }
        }
        return invertases;
	};

	/*
    Returns an integer array of the current permutation of parts. For InvertSim
    objects, the parts always begin with P and end with a number. The
    returned permutation is the order of the parts based on these numbers.

    @return
    */
	InvertSim.prototype.getCurrentPerm = function() {
		 // used in the following loop to create a substring of each part
        var currentPart = "";
        var n = this.getNumberOfParts();

        // loop through the parts and determine the current configuration
        var i;
        for (i = 0; i < n; i++) {
            // for clarity, first get current part
            currentPart = this.getPart(i);

            // then only get the substring (get rid of the "P" at the beginning
            // and the " " at the end of each par
            this.currentPerm[i] = parseInt(currentPart.substring(1, currentPart.length));
        }
        return this.currentPerm;
	};

	/*
    Converts the string representation of the part permutation into an integer
    representation.
	
	@param permutationArray
    @return
    */
	InvertSim.prototype.getIntPartPerm = function(permutationArray) {
		var n = permutationArray.length;
        var intPerm = [];
        for (i = 0; i < n; i++) {
            // all parts for must begin with P
            if (permutationArray[i].charAt(0) !== "P") {
                throw "Each part needs to begin with 'P'!";
            }

            // assemble the integer array
            if (permutationArray[i].charAt(permutationArray[i].length - 1) === "'") {
                intPerm[i] = parseInt(permutationArray[i].substring(1, permutationArray[i].length - 1));
            } else {
                intPerm[i] = parseInt(permutationArray[i].substring(1, permutationArray[i].length));
            }
        }

        // check the integer array
        this.checkPermutation(intPerm);
        return intPerm;
	};

	/*
    Determines the current configuration of parts and returns this as a
    string. This method disregards the complements of parts (i.e. "'").

    @return
    */
	InvertSim.prototype.getPartPerm = function() {
		// define the string used for output
        var currentConfig = "";

        // loop through the designArray
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            // check if the element is a part or it is an invertase
            if (this.designArray[i].charAt(0) !== "I") {
                // if it is a part, check whether it is complement
                if (this.designArray[i].charAt(this.designArray[i].length - 1) === "'") {
                    currentConfig = currentConfig + this.designArray[i].substring(0, this.designArray[i].length - 1)  + " ";
                } else {
                    currentConfig = currentConfig + this.designArray[i] + " ";
                }
            }
        }

        // return the string
        return currentConfig;
	};

	/*
    Allows extensions of InvertSim to get the original design.

    @return
    */
	InvertSim.prototype.getOriginalDesign = function() {
		return this.originalDesign;
	};

	/*
    Returns the bit map value of the supplied index. If this method returns
    a 1, then the part construct is currently flipped. If it returns a 0,
    the part construct has not been flipped.
     
    @param index
    @return
    */
	InvertSim.prototype.getBitMapValue = function(index) {
		return this.flipBitMap[index];
	};

	/*
    Returns the current flipBitMap which indicates which elements in the
    design are currently flipped.

    @return
    */
	InvertSim.prototype.getBitMap = function() {
		return this.flipBitMap;
	};

	/*
    Allows other algorithms to quickly determine the number of parts.

    @return
    */
	InvertSim.prototype.getNumberOfParts = function() {
		return this.parts.length;
	};

	/*
    Allows other algorithms to access the design array.

    @return
    */
	InvertSim.prototype.getDesignArray = function() {
		return this.designArray;
	};

	/*
    Allows other algorithms to access the entire parts array.

    @return
    */
	InvertSim.prototype.getParts = function() {
		return this.parts;
	};

	/*
    Enables access to a particular part in the array of parts.

	@param index
    @return
    */
	InvertSim.prototype.getPart = function(index) {
		return this.parts[index];
	};

	/*
    Returns all part permutations for this InvertSim object.

    @return
    */
	InvertSim.prototype.getAllPartPermutations = function() {
		if (!this.isPermsGenerated) {
            this.generatePartPermutations(this.getParts(), "");
            this.isPermsGenerated = false;
        }
        return this.partPermutations;
	};

	/*
    Returns the current design array as a string. This includes invertases
    and parts.

    @return
    */
	InvertSim.prototype.designString = function() {
		var design = "";
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            design = design + this.designArray[i] + " ";
        }
        return design;
	};

	/*
    Prints the current part configuration as a string. This includes the
    complements (i.e. "'").
    */
	InvertSim.prototype.partsString = function() {
		// define the string used for output
        var currentConfig = "";

        // loop through the designArray
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            // check if the element is a part or it is an invertase
            if (this.designArray[i].charAt(0) !== "I") {
                currentConfig = currentConfig + this.designArray[i] + " ";
            }
        }

        // return the string
        return currentConfig;
	};

	/*
    Returns true if this InvertSim object distinguishes between inverted parts
    and non-inverted parts. Otherwise, this method returns false.

    @return
    */
	InvertSim.prototype.isCombos = function() {
		if (combos) {
            return true;
        } else {
            return false;
        }
	};

	/*
	This class extends the InvertSim class. It is a special type of InvertSim
	which uses the "Pancake" Algorithm to place invertases in particular positions
	between parts, such that every permutation of parts has at least one invertase
	key.

    Creates a Pancake invertase design given the number of parts in the
    design.
    
    @param n - The number of parts
    @param comb - Whether the object discerns between inverted and non-ineverted parts
    */
	var Pancake = function(n, comb) {
		InvertSim.call(this);

	    // initialize the bitMapArray for this object
	    this.flipBitMap = [];
	    var i;
	    for (i = 0; i < n; i++) {
	        this.flipBitMap[i] = 0;
	    }

	    // boolean which describes wether inverted parts are recognized separately
	    // from non-inverted parts
	    this.combos = comb;

	    // create integer currentPer which keeps track of the permutation of parts
	    // by their integer value
	    this.currentPerm = [];

	    // create the actual Pancake Design
	    this.createDesign(n);

	    // define the parts array
	    for (i = 0; i < this.designArray.length; i++) {
	        if (this.designArray[i].charAt(0) !== "I") {
	            this.addPart(this.designArray[i]);
	        }
	    }

	    //initialize partPermutations with all possible part Permutations
	    this.partPermutations = [];

	    // now that the object has been made, set the original design field before
	    // the design array is changed
	    this.setOriginalDesign(this.designString());
	};

	Pancake.prototype = Object.create(InvertSim.prototype);
	Pancake.prototype.constructor = Pancake;

    /*
    Creates the actual design given the number of parts, n. It also sets
    the invertSim design array to this generated design.
    
    @param n - Number of parts
    */
    Pancake.prototype.createDesign = function(n) {
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
                partSuffix[j] = partSuffix[j] + invsToAdd;
            }
        }

        // create each part's prefix
        currentInvNum--;
        for ( i = 0; i < 2*n - 3; i++) {
            for (j = n; j >= 1; j--) {
                partPrefix[j - 1] = partPrefix[j - 1] + "I" + currentInvNum + " ";
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
            design = design + constructPrefix[i];
        }

        // reset current inv for combos
        currentInvNum = 4*n*n - 6*n + 1;

        // now add each parts prefix, part, and suffix
        for (i = 0; i < n; i++) {
            design = design + partPrefix[i];
            if (combos) {
                design = design + "I" + currentInvNum + " ";
            }
            design = design + parts[i];
            if (combos) {
            	currentInvNum++;
                design = design + "I" + currentInvNum + "' ";
            }
            design = design + partSuffix[i];
        }
        this.setDesignArray(design);
    };

    /*
    Generates the necessary invertase key for obtaining the specified
    permutation. This key always describes how to get to the desired target
    from the ORIGINAL DESIGN!
    
    @param target - target permutation (For example, "P1 P3 P2'")
    */
    Pancake.prototype.generateKey = function(target) {
        // string of invertase numbers that will be delivered to the user
        var invertaseKey = "";
        var targetStringPerm = target.split(" ");
		var targetPerm = [];

        // check the targetPerm and set the integer representation of this
        // permutation
        try {
            targetPerm = this.getIntPartPerm(targetStringPerm);
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
        var oldDesign = this.designString();
        this.setDesignArray(this.getOriginalDesign());
        var targetValue = 0;
        var currentValue = 0;
        var index = -1;
        var tempInvertase = -1;
        var n = this.getNumberOfParts();
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
                if (targetValue != this.currentPerm[0]) {
                    // flip the target value to the front
                    usedLayer = true;

                    // first check if the value's bit map is flipped
                    if (this.getBitMapValue(targetValue - 1) == 1) {
                        // if it has been flipped, then flip it's construct\
                        tempInvertase = layer*n*2 - 2*(n - targetValue);

                        // add this to the invertase key
                        invertaseKey = invertaseKey + tempInvertase + " ";

                        // make the flip
                        if (this.isInversionPossible(JSON.stringify(tempInvertase))) {
                            this.invert();
                        }
                    }

                    // now that the part is oriented correctly, flip it to the front
                    // first calculate the invertase for doing so
                    tempInvertase = layer*n*2 - 2*(n - targetValue) - 1;

                    // add this to the key
                    invertaseKey = invertaseKey + tempInvertase + " ";

                    // make the flip
                    if (this.isInversionPossible(JSON.stringify(tempInvertase))) {
                        this.invert();
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
                if (this.getBitMapValue(currentValue - 1) == 1) {
                    // if it has been flipped, then flip it's construct
                    tempInvertase = layer*n*2 - 2*(n-currentValue);

                    // add this to the invertase key
                    invertaseKey = invertaseKey + tempInvertase + " ";

                    // make the flip
                    if (this.isInversionPossible(JSON.stringify(tempInvertase))) {
                        this.invert();
                    }
                }
                // now that the part is oriented correctly, flip it to the i position
                // first calculate the invertase for doing so
                tempInvertase = layer*n*2 - 2*(n - currentValue) - 1;

                // add this to the key
                invertaseKey = invertaseKey + tempInvertase + " ";

                // make the flip
                if (this.isInversionPossible(JSON.stringify(tempInvertase))) {
                    this.invert();
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
                    if (this.getBitMapValue(primedIndex) == 0) {
                        // add invertase to flip the part
                        tempInvertase = 4*n*n - 6*n + primedIndex + 1;
                        invertaseKey = invertaseKey + tempInvertase + " ";
                    }
                }
                // if the part should not be primed
                else {
                    // again get the part index
                    primedIndex = parseInt(targetStringPerm[i].substring(1, targetStringPerm[i].length)) - 1;

                    // check if the part is primed yet
                    if (this.getBitMapValue(primedIndex) == 1) {
                        // add invertase to flip the part
                        tempInvertase = 4*n*n - 6*n + primedIndex + 1;
                        invertaseKey = invertaseKey + tempInvertase + " ";
                    }
                }
            }
        }

        // reset the original design
        this.setDesignArray(oldDesign);

        // return the final key
        return invertaseKey;
    };

    /*
    Returns the algorithm used to create the design array for this InvertSim.
    */
    Pancake.prototype.getAlgorithm = function() {
        return "Pancake";
    };

    /*
    Creates a "fresh" copy of this InvertSim object. The returned Pancake
    object has the original design as it's current design array.
    
    @return
    */
    Pancake.prototype.cloneFresh = function() {
        return new pancake(this.getNumberOfParts(), this.isCombos());
    };

    /*
	This class extends the InvertSim class. It is a special type of InvertSim
	which uses the "LinkSort" Algorithm to place invertases in particular positions
	between parts, such that every permutation of parts has at least one invertase
	key.

    Creates a LinkSort invertase design given the number of parts in the
    design.
    
    @param n - The number of parts
    @param comb - Whether the object discerns between inverted and non-ineverted parts
    */
    var LinkSort = function(n, comb) {
	    InvertSim.call(this);

	    // initialize the bitMapArray for this object
	    this.flipBitMap = [];
	    var i;
	    for (i = 0; i < n; i++) {
	        this.flipBitMap[i] = 0;
	    }

	    // combos represents whether this object discerns between inverted parts
	    // and non-inverted parts
	    this.combos = comb;
	    
	    // create integer currentPer which keeps track of the permutation of parts
	    // by their integer value
	    this.currentPerm = [];

	    // create the LinkSort design
	    this.createDesign(n);

	    // define the parts array
	    for (i = 0; i < this.designArray.length; i++) {
	        if (this.designArray[i].charAt(0) !== "I") {
	            this.addPart(this.designArray[i]);
	        }
	    }

	    //initialize partPermutations with all possible part Permutations
	    this.partPermutations = [];

	    // now that the design array has been created, retain this original design
	    // before the array is altered
	    this.setOriginalDesign(this.designString());
	};

	LinkSort.prototype = Object.create(InvertSim.prototype);
	LinkSort.prototype.constructor = LinkSort;

    /*
    Creates the actual design given the number of parts, n. It also sets
    the invertSim design array to this generated design.
    
    @param n - Number of parts
    */
    LinkSort.prototype.createDesign = function(n) {
        // =========================== VARIABLES ===================================
        // string that will be returned to the user
        var linkSortDesign = "";

        //  stores each part's prefix for each layer
        var layerPrefix = [];
        var i;
        for (i = 0; i < n; i++) {
            layerPrefix[i] = "";
        }

        //  stores each part's prefix for each layer
        var partPrefix = [];
        for (i = 0; i < n; i++) {
            partPrefix[i] = "";
        }
        var layerSuffix = [];
        for (i = 0; i < n; i++) {
            layerSuffix[i] = "";
        }
        var partSuffix = [];
        for (i = 0; i < n; i++) {
            partSuffix[i] = "";
        }

        // currentInv keeps track of the current invertase being added
        var currentInv = 1;

        // linkInv is used to place the linked invertases around each part
        var linkInv = 0;

        // ============================ ALGORITHM ==================================
        // initialize linksort to the prefix for link sort
        for (i = 0; i < n - 1; i++) {
            // make sure to increment the current invertase number
            currentInv++;
            linkSortDesign = linkSortDesign + "I" + currentInv + " ";
        }

        // loop through each layer, there are n - 2 layers
        var layer;
        var j;
        for (layer = 1; layer <= n - 2; layer++) {
            // loop through each part and create each part's layer
            for (i = 0; i < n; i++) {
                // make a copy of the current Inv used for add the link invertases
                linkInv = currentInv;

                // for each part, each layer begins with (n - 1) invertases
                for (j = 1; j <= n - 1; j++) {
                    // stores the 4(n - 1) invertases that begin each part's string
                    currentInv++;
                    layerPrefix[i] = layerPrefix[i] + "I" + currentInv + " ";
                }

                // loop through the parts and create their link Prefxes
                for (j = 0; j < n; j++) {
                    if (j != i) {
                        linkInv++;
                        layerSuffix[j] = layerSuffix[j] + "I" + linkInv + "' ";
                    }
                }

                // clear linkInv counter for next layer
                linkInv = 0;
            }

            // before moving on to the next layer assemble the current layer's
            // prefix by appending the layerprefix for each part with that
            // part's linkPrefix
            for (i = 0; i < n; i++) {
                // add the orienting invertase for the prefix
                layerPrefix[i] = "I" + currentInv + " " + layerPrefix[i];

                // add it's complement to the end of the suffix
                currentInv++;
                layerSuffix[i] = layerSuffix[i] + "I" + currentInv + "' ";

                // now append the temporary layer suffix and prefix to the part prefix and suffix
                partPrefix[i] = partPrefix[i] + layerPrefix[i];
                partSuffix[i] = layerSuffix[i] + partSuffix[i];

                // clear the layerPrefix and the layerSuffix
                layerPrefix[i] = "";
                layerSuffix[i] = "";
            }
        }

        // finally compose the complete design
        // loop through each part
        for (i = 0; i < n; i++) {
            // add the prefix, part name, suffix and, first layer switch
            linkSortDesign = linkSortDesign + partPrefix[i];
            if (combos) {
                linkSortDesign = linkSortDesign + "I" + currentInv + " ");
            }
            linkSortDesign = linkSortDesign + "P" + (i + 1) + " ";
            if (combos) {
                currentInv++;
                linkSortDesign = linkSortDesign + "I"+ currentInv + "' ";
            }
            linkSortDesign = linkSortDesign + partSuffix[i];
            if (i != 0) {
                linkSortDesign = linkSortDesign + "I" + (n - i) + "' ";
            }
        }

        // the design array to this this design
        this.setDesignArray(linkSortDesign);
    };

    /*
    Generates the necessary invertase key for obtaining the specified
    permutation. This key always describes how to get to the desired target
    from the ORIGINAL DESIGN!
    
    @param target - target permutation (For example, "P1 P3 P2'")
    */
    LinkSort.prototype.generateKey = function(target) {
        // string of invertase numbers that will be delivered to the user
        var invertaseKey = "";
        var targetStringPerm = target.split(" ");
        var targetPerm = [];

        // check the targetPerm and set the integer representation of this
        // permutation
        try {
            targetPerm = this.getIntPartPerm(targetStringPerm);
        }
        catch (err) {
            console.log(err);
        }

        // create the sorted configuration
        var sortedConfig = [];
        var i;
        for (i = 0; i < targetPerm.length; i++) {
            sortedConfig[i] = targetPerm[i];
        }
        sortedConfig.sort(function(a, b) {
            return a - b;
        });

        // record the design of the object
        var oldDesign = this.designString();
        this.setDesignArray(this.getOriginalDesign());

        // n represents the number of elements in the configuration
        var n = targetPerm.length;

        // current value will be the value of the element stored in the current
        // index of the flip being made
        var currentValue = 0;

        // target value will be the value of the element that current value will
        // be linked to
        var targetValue = 0;

        // invertase will be the value of the invertase that gets appended to
        // the invertase key
        var invertase = 0;
        var actualLayer = 0;

        // there are n - 1 switches that should be made
        // this loop iterates through those switches
        for (i = 0; i < n - 1; i++) {
            // find the current value
            currentValue = currentPerm[i];

            // find the target value
            targetValue = targetPerm[i];

            // first check if the current value is the correct place
            if (currentValue != targetValue) {
                // the first switch is very simple
                if (i == 0) {
                    // calculate the invertase
                    invertase = n + 1 - targetValue;

                    // append this to the invertase key
                    invertaseKey = invertaseKey + invertase + " ";

                    // make the switch
                    if (this.isPossible(JSON.stringify(invertase))) {
                        this.invert();
                    }

                    // increment actual layer since a switch needs to be made
                    actualLayer++;
                }
                // if it is not the first switch, then the invertase calculations
                // are different
                else {
                    // does the current value's part construct need to be flipped
                    if (this.getBitMapValue(currentValue - 1) == 1) {
                        // calculate the invertase necessary to flip this
                        invertase = n - 1 + n*(n - 1)*actualLayer + (actualLayer - 1)*n + currentValue;

                        // append this to the invertase key
                        invertaseKey = invertaseKey + invertase + " ";

                        // make the flip
                        if (this.isPossible(JSON.stringify(invertase))) {
                            this.invert();
                        }
                    }

                    // does the target value's part construct need to be flipped
                    if (this.getBitMapValue(targetValue - 1) == 1) {
                        // calculate the invertase necessary to flip this
                        invertase = n - 1 + n*(n - 1)*actualLayer + actualLayer - 1)*n + targetValue;

                        // appennd this to the invertase key
                        invertaseKey = invertaseKey + invertase + " ";

                        // make the flip
                        if (this.isPossible(JSON.stringify(invertase))) {
                            this.invert();        
                        }
                    }

                    // calculate the swap invertase
                    // invertase = (n+(i-1)*(n*(n-1)+n)-1)+(currentValue-1)*(n-1);
                    invertase = n + (actualLayer - 1)*(n*(n - 1) + n) - 1 + (currentValue - 1)*(n - 1);

                    // counter keeps track of the invertase value that will be
                    // added to the final swap invertase
                    var counter = 1;

                    // tempInvertase keeps track of which invertase we check
                    // in the following loop
                    var tempInvertase = 1;

                    // loop through the invertase values and determine what
                    // linking invertase should be added to the key
                    while (tempInvertase != targetValue) {
                        if (tempInvertase != currentValue) {
                           counter++;
                        }
                        tempInvertase++;                            
                    }

                    // add the counter to finalize the invertase
                    invertase = invertase + counter;

                    // append this to the invertase key
                    invertaseKey = invertaseKey + invertase + " ";

                    // make the switch
                    if (this.isPossible(JSON.stringify(invertase))) {
                        this.invert();
                    }

                    // increment actual layer since a switch needs to be made
                    actualLayer++;
                }
            }
            if (actualLayer == 0) {
                actualLayer++;
            }
        }

        // if the object discerns between inverted and non-inverted parts, then
        // make sure that all of the parts are in the correct orientation
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
                    if (this.getBitMapValue(primedIndex) == 0) {
                        // add invertase to flip the part
                        invertase = (n - 2)*(n - 1)*n + n - 1 + n*(n - 2) + primedIndex + 1;
                        invertaseKey = invertaseKey + invertase + " ";
                    }
                }
                // if the part should not be primed
                else {
                    // again get the part index
                    primedIndex = parseInt(targetStringPerm[i].substring(1, targetStringPerm[i].length)) - 1;
                   
                    // check if the part is primed yet
                    if (this.getBitMapValue(primedIndex) == 1) {
                        // add invertase to flip the part
                        invertase = (n - 2)*(n -1 )*n + n - 1 + n*(n - 2) + primedIndex + 1;
                        invertaseKey = invertaseKey + invertase + " ";
                    }
                }
            }
        }

        // reset the original design
        this.setDesignArray(oldDesign);

        // return the finished invertase key
        return invertaseKey;
    };

    /*
    Returns the algorithm used to create the design array for this InvertSim.
    */
    LinkSort.prototype.getAlgorithm = function() {
        return "LinkSort";
    };

    /*
    Creates a "fresh" copy of this InvertSim object. The returned LinkSort
    object has the original design as it's current design array.
    
    @return
    */
    LinkSort.prototype.cloneFresh = function() {
        return new linkSort(this.getNumberOfParts(), this.isCombos());
    };

    /////////////////////////////////////////////////////////////////// 
	//                        Trumpet Object                         //
	///////////////////////////////////////////////////////////////////
	window.Trumpet = Trumpet.prototype = {
		design: function(partIDs, mode) {
			var partDict = {};
			var i;
			for (i = 0; i < partIDs.length; i++) {
				partDict["P" + i] = partIDs[i];
			}
			var sim;
			if (mode === "pancake") {
				sim = new Pancake(partIDs.length, true); 
			} else if (mode === "linksort") {
				sim = new LinkSort(partIDs.length, true);
			}
			var design = sim.getDesignArray();
			for (i = 0; i < design.length; i++) {
				if (partDict[design[i]] != null) {
					design[i] = partDict[design[i]];
				}
			}
			return design;
		}
	};

})(Trumpet = window.Trumpet || {});
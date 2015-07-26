// @author Craig LaBoda
function invertSim() {
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

    // Checks whether it is possible to make an inversion, given the input
    // invertase string. If it is possible, this method sets the currentSites
    // values necessary for making the inversion using the invert() method.
    // If it is impossible, this method returns false.
	this.isInversionPossible = function(invertase) {
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

    // Once the current sites are set using the isPossible method, call this
    // method to make the actual inversion using those sites
	this.invert = function() {
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
                this.designArray[i] = this.designArray[i].concat("'");
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

    // Returns the table of invertase keys for the permutations specified. It
    // also shortens the design and keeps only the necessary invertases. The
    // invertases which are kept are renumbered accordingly.
    //
    // @param permutations - a list of permutations which should be achieved
    // @return
    this.tailorDesign = function(permutations) {
        var tailoredKeyTable = this.generateTailoredKeyTable(permutations);
        // now we know which invertases we need to keep, we can delete all the other invertases
        this.removeInvertases(tailoredKeyTable);
        return tailoredKeyTable;
    };

    // Removes all invertases from the design except for the invertases provided
    // in the second column of the table.
    //
    // @param tailoredKeyTable - Table of permutations and invertase keys
    this.removeInvertases = function(tailoredKeyTable) {
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

    // Returns a key table which includes the listings for only the permutations
    // specified.
    //
    // @param permutations
    // @return
    this.generateTailoredKeyTable = function(permutations) {
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
                    if (key[j] != null)
                        editedKey = editedKey.concat(key[j] + " ");
                }
                // finally replace the original with the edited
                tailoredKeyTable[i][1] = editedKey;
            }
            return tailoredKeyTable;
        }
    };

    // Generates entire table of keys. Each entry has two columns. The first
    // is the permutation of parts. The second is the invertase key which leads
    // to that permutation.
    //
    // @return
    this.generateKeyTable = function() {
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


    // This bare bones permutation algorithm spits out all permutations of any
    // String array. It is currently set to also call the generate
    // subPerms so as to include all permutations of parts.
    //
    // @param inputArray
    // @param next
    this.generatePartPermutations = function(inputArray, next) {
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
               copy = next.concat(inputArray[i] + " ");
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

    // Adds all sub-permutations of the current part permutation. This distinguishes
    // between a permutation with complements and a permutation without
    // complements.
    //
    // @param next
    this.generateSubPerms = function(next) {
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
                    newPerm = newPerm.concat(currentPartPerm[j] + "' ");
                } else {
                    newPerm = newPerm.concat(currentPartPerm[j] + " ");
                }
            }
            this.partPermutations.push(newPerm);
            newPerm = "";
        }
    };

    // Converts a decimal number to it's binary representations. NumberOfBits
    // specifies how many bits long the return integer array representation will be.
    //
    // @param decimalInt
    // @param numberOfBits
    // @return
    this.intToBitRep = function(decimalInt, numberOfBits) {
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

    // Checks whether the integer representation of the part permutation
    // contains all of the correct elements, and each element only once.
    //
    // @param permutation
    // @throws PermutationException
    this.checkPermutation = function(permutation) {
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
        sorted = [];
        check.toArray(sorted);
        sorted.sort(function(a, b) {
            return a - b;
        });
        // check that elements are not repeated
        for (i = 0; i < n; i++) {
            if (sorted[i] != (i + 1)) {
                throw "Permutation does not make sense!";
            }
        }
    };

    // Allows InvertSim extensions to access the parts list when creating a
    // design.
    //
    // @param part
    this.addPart = function(part) {
        this.parts.push(part);
    };

    // Sets the current part permutation. This should only be called from
    // invert().
    this.setCurrentPerm = function() {
        var currentPartConfiguration = this.getPartPerm();
        var tempPartPerm = currentPartConfiguration.split(" ");
        var currentPart = "";
        var i;
        for (i = 0; i < tempPartPerm.length; i++) {
            currentPart = tempPartPerm[i];
            currentPerm[i] = parseInt(currentPart.substring(1, currentPart.length));
        }
    };

    // Sets the bit of index i. If the bit is 0, then it is set to 1. If the
    // bit is 1, then it is set to 0.
    //
    // @param i Index of the bit map that will be flipped.
    this.setBitMap = function(i) {
        if (this.flipBitMap[i] == 0) {
            this.flipBitMap[i] = 1;
        } else {
            this.flipBitMap[i] = 0;
        }
    };

    // Takes a string input, with each part separated by spaces
    // splits this string and sets it to the current design array
    this.setDesignArray = function(design) {
        this.designArray = design.split(" ");
        this.clearBitMap();
        this.setCurrentPerm();
    };

    // Allows extensions of InvertSim to specify the original design.
    this.setOriginalDesign = function(design) {
        this.originalDesign = design;
    };

    // Sets all values of the Flip Bit Map to 0.  Used at the end of the key
    // generator.
    this.clearBitMap = function() {
        var i;
        for (i = 0; i < this.flipBitMap.length; i++) {
            this.flipBitMap[i] = 0;
        }
    };

    // Returns a list of all invertases within the current design array.
    //
    // @return
    this.getInvertases = function() {
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

    // Returns an integer array of the current permutation of parts. For InvertSim
    // objects, the parts always begin with P and end with a number. The
    // returned permutation is the order of the parts based on these numbers.
    this.getCurrentPerm = function() {
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

    // Converts the string representation of the part permutation into an integer
    // representation.
    this.getIntPartPerm = function(permutationArray) {
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

    // Determines the current configuration of parts and returns this as a
    // string. This method disregards the complements of parts (i.e. "'").
    this.getPartPerm = function() {
        // define the string used for output
        var currentConfig = "";
        // loop through the designArray
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            // check if the element is a part or it is an invertase
            if (this.designArray[i].charAt(0) !== "I") {
                // if it is a part, check whether it is complement
                if (this.designArray[i].charAt(this.designArray[i].length - 1) === "'") {
                    currentConfig = currentConfig.concat(this.designArray[i].substring(0, this.designArray[i].length - 1)  + " ");
                } else {
                    currentConfig = currentConfig.concat(this.designArray[i] + " ");
                }
            }
        }
        // return the string
        return currentConfig;
    };

    // Allows extensions of InvertSim to get the original design.
    this.getOriginalDesign = function() {
        return this.originalDesign;
    };

    // Returns the bit map value of the supplied index. If this method returns
    // a 1, then the part construct is currently flipped. If it returns a 0,
    // the part construct has not been flipped.
    this.getBitMapValue = function(index) {
        return this.flipBitMap[index];
    };

    // Returns the current flipBitMap which indicates which elements in the
    // design are currently flipped.
    this.getBitMap = function() {
        return this.flipBitMap;
    };

    // Allows other algorithms to quickly determine the number of parts.
    //
    // @return
    this.getNumberOfParts = function() {
        return this.parts.length;
    };

    // Allows other algorithms to access the design array.
    //
    // @return
    this.getDesignArray = function() {
        return this.designArray;
    };

    // Allows other algorithms to access the entire parts array.
    //
    // @return
    this.getParts = function() {
        return this.parts;
    };

    // Enables access to a particular part in the array of parts.
    this.getPart = function(index) {
        return this.parts[index];
    };

    // Returns all part permutations for this InvertSim object.
    //
    // @return
    this.getAllPartPermutations = function() {
        if (!this.isPermsGenerated) {
            this.generatePartPermutations(this.getParts(), "");
            this.isPermsGenerated = false;
        }
        return this.partPermutations;
    };

    // Returns the current design array as a string. This includes invertases
    // and parts.
    this.designString = function() {
        var design = "";
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            design = design.concat(this.designArray[i] + " ");
        }
        return design;
    };

    // Prints the current part configuration as a string. This includes the
    // complements (i.e. "'").
    this.partsString = function() {
        // define the string used for output
        var currentConfig = "";
        // loop through the designArray
        var i;
        for (i = 0; i < this.designArray.length; i++) {
            // check if the element is a part or it is an invertase
            if (designArray[i].charAt(0) !== "I") {
                currentConfig = currentConfig.concat(designArray[i] + " ");
            }
        }
        // return the string
        return currentConfig;
    };

    // Returns true if this InvertSim object distinguishes between inverted parts
    // and non-inverted parts. Otherwise, this method returns false.
    //
    // @return
    this.isCombos = function() {
        if (combos)
            return true;
        else
            return false;
    };
}


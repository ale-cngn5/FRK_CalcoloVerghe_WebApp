// TubolarCalculator
class TubolarCalculator {
    constructor(tubolarMap, useOptimal = true) {
        this.tubolarMap = tubolarMap;
        this.useOptimal = useOptimal;
    }

    calculate() {
        const results = {};
        
        for (const [type, tubolarArray] of Object.entries(this.tubolarMap)) {
            if (this.useOptimal) {
                results[type] = this.calculateOptimal(tubolarArray);
            } else {
                results[type] = this.calculateWithRodLength(tubolarArray, STANDARD_ROD);
            }
        }
        
        return results;
    }

    calculateOptimal(tubolarArray) {
        const resultStandard = this.calculateWithRodLength(tubolarArray, STANDARD_ROD);
        const resultExtended = this.calculateWithRodLength(tubolarArray, EXTENDED_ROD);
        
        // Return the solution that uses fewer rods
        const standardTotal = resultStandard.length;
        const extendedTotal = resultExtended.length;
        const extendedEquivalent = extendedTotal * 2; // Each 12m rod equals two 6m rods
        
        return standardTotal <= extendedEquivalent ? resultStandard : resultExtended;
    }

    calculateWithRodLength(tubolarArray, rodLength) {
        const results = [];
        const workingList = [];
        
        // Create working list with all pieces
        tubolarArray.forEach(tubolar => {
            for (let i = 0; i < tubolar.quantity; i++) {
                workingList.push({
                    length: tubolar.length,
                    type: tubolar.type
                });
            }
        });
        
        // Sort by length descending (largest first)
        workingList.sort((a, b) => b.length - a.length);
        
        // Bin packing algorithm
        while (workingList.length > 0) {
            let remainingLength = rodLength;
            const cuts = [];
            let i = 0;
            
            while (i < workingList.length) {
                const piece = workingList[i];
                
                if (piece.length <= remainingLength) {
                    cuts.push({
                        length: piece.length,
                        type: piece.type
                    });
                    remainingLength -= (piece.length + SAW_BLADE_LOSS);
                    workingList.splice(i, 1);
                } else {
                    i++;
                }
            }
            
            if (cuts.length > 0) {
                results.push({
                    rodLength: rodLength,
                    cuts: cuts,
                    waste: Math.max(0, remainingLength)
                });
            }
        }
        
        return results;
    }

    getTotalStatistics(results) {
        let total6m = 0;
        let total12m = 0;
        let totalWaste = 0;
        let totalCuts = 0;

        for (const [type, rods] of Object.entries(results)) {
            rods.forEach(rod => {
                if (rod.rodLength === STANDARD_ROD) {
                    total6m++;
                } else {
                    total12m++;
                }
                totalWaste += rod.waste;
                totalCuts += rod.cuts.length;
            });
        }

        return {
            total6m,
            total12m,
            totalRods: total6m + total12m,
            totalWaste,
            totalCuts,
            averageWaste: totalCuts > 0 ? (totalWaste / (total6m + total12m)).toFixed(2) : 0
        };
    }
}

// Tubolar model
class Tubolar {
    constructor(type, length, quantity, description = '', material = '') {
        this.type = type;
        this.length = parseInt(length);
        this.quantity = parseInt(quantity);
        this.description = description;
        this.material = material;
    }

    getTotalLength() {
        return this.length * this.quantity;
    }
}

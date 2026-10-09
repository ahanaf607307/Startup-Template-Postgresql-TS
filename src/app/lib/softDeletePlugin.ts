const softDeletePlugin = (schema: any, options: any) => {
    schema.add({
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date }
    });

    // Soft Delete Method
    schema.methods.softDelete = async function (this: any) {
        this.isDeleted = true;
        this.deletedAt = new Date();
        await this.save();
    };

    // Restore Method
    schema.methods.restore = async function (this: any) {
        this.isDeleted = false;
        this.deletedAt = null;
        await this.save();
    };

    // Default Query Modification
    schema.pre(/^find/, function (this: any, next: any) {
        this.find({ isDeleted: { $ne: true } });
        next();
    });

    // Adding Index for Faster Queries
    schema.index({ isDeleted: 1 });
}

export default softDeletePlugin;
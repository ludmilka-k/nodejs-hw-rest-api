const runValidateAtUpdate = function(next) {
    this.options.runValidators = true;
    next();
}

export default runValidateAtUpdate;
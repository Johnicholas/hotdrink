(function () {

  var runtime = hd.__private.runtime;
  var factory = hd.__private.factory;

  /***************************************************************/
  /* Helpers. */

  factory.addVariable = function addVariable(cellType, initialValue) {
    var vv = new hd.__private.Variable(cellType, initialValue);
    runtime.touch(vv);
    hd.behaviors.forEach(function (behavior) {
      if (behavior.variable) {
        behavior.variable(vv);
      }
    });
    LOG("added " + vv);
    INSPECT(vv);
    return vv;
  };

  factory.addMethod = function addMethod(outputs, fn, context) {
    var mm     = new hd.__private.Method(outputs, fn);
    mm.context = context ? context : factory.contexts[0];
    return mm;
  };

  factory.addConstraint = function addConstraint(methods) {
    var cc = new hd.__private.Constraint(methods);
    return cc;
  };

  /***************************************************************/
  /* Variables. */

  /* Does everything but create the proxy. Allows us to create different
   * proxies for different types of variables. */
  factory.addComputedVariable
    = function addComputedVariable(cellType, fn, context)
  {
    var initialValue;
    var vv = factory.addVariable(cellType, initialValue);
    var mm = factory.addOneWayConstraint([vv], fn, context);
    return vv;
  };

  /* Create a new one-way constraint.
   *
   * Note: There is no actual constraint, just a single method. */
  factory.addOneWayConstraint
    = function addOneWayConstraint(outputs, fn, context)
  {
    var mm = factory.addMethod(outputs, fn, context);
    factory.setOneWayConstraint(mm);
    runtime.enqueue(mm);
    return mm;
  };

  /* Make an existing constraint one-way. */
  factory.setOneWayConstraint = function setOneWayConstraint(mm) {
    /* Optimization: no constraint, no solver, fixed solution. */
    mm.isSelected = true;
    mm.needsExecution = true;
    //delete mm.constraint;
    mm.outputs.forEach(function (ww) {
      ww.writtenBy = mm;
    });
  };

  /* Make an existing constraint multi-way. */
  factory.setMultiWayConstraint = function setMultiWayConstraint(mm, cc) {
    delete mm.isSelected;
    delete mm.needsExecution;
    mm.constraint = cc;
    mm.outputs.forEach(function (ww) {
      delete ww.writtenBy;
    });
  };

}());


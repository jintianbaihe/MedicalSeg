export default function widgetBehavior(publicAPI, model) {
  const superBehavior = { ...publicAPI };

  const watchers = [];
  let prevCallData = null;

  function retriggerMouseMove() {
    if (prevCallData) {
      superBehavior.handleMouseMove(prevCallData);
    }
  }

  publicAPI.handleMouseMove = (callData) => {
    const ret = superBehavior.handleMouseMove(callData);
    prevCallData = callData;
    return ret;
  };

  publicAPI.delete = () => {
    superBehavior.delete();
    while (watchers.length) {
      watchers.pop().unsubscribe();
    }
  };
  watchers.push(model.manipulator.onModified(() => retriggerMouseMove()));
}

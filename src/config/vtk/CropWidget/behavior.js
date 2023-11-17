export default function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push('vtkCropWidgetProp');

  model.representations
    .filter((rep) => rep.isA('vtkOutlineContextRepresentation'))
    .forEach((rep) =>
      rep.getActor().getProperty().set({ ambient: 1, diffuse: 0 })
    );

  model.widgetState
    .getAllNestedStates()
    .filter((state) => !!state.setScale1)
    .forEach((state) => state.setScale1(20));
}

import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkLookupTableProxy from "@kitware/vtk.js/Proxy/Core/LookupTableProxy";
import { vec3 } from "gl-matrix";
import { getDiagonalLength } from "@kitware/vtk.js/Common/DataModel/BoundingBox";
import vtkPiecewiseFunctionProxy from "@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy";
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";

export function useCameraOrientation(viewDirection, viewUp, imageMetadataRef) {
  const orientationMatrix = imageMetadataRef.orientation;
  const lpsDirections = getLPSDirections(orientationMatrix);
  const cameraDirVec = lpsDirections[viewDirection];
  const cameraUpVec = lpsDirections[viewUp];
  return {
    cameraDirVec,
    cameraUpVec,
  };
}

export function resetOpacityFunction(pwfProxy, dataRange, presetName) {
  pwfProxy.setDataRange(...dataRange);
  const preset = vtkColorMaps.getPresetByName(presetName);
  if (preset.OpacityPoints) {
    const OpacityPoints = preset.OpacityPoints;
    const points = [];
    for (let i = 0; i < OpacityPoints.length; i += 2) {
      points.push([OpacityPoints[i], OpacityPoints[i + 1]]);
    }

    const [xmin, xmax] = dataRange;
    const width = xmax - xmin;
    const pointsNormalized = points.map(([x, y]) => [(x - xmin) / width, y]);

    pwfProxy.setMode(vtkPiecewiseFunctionProxy.Mode.Points);
    pwfProxy.setPoints(pointsNormalized);
  } else {
    pwfProxy.setMode(vtkPiecewiseFunctionProxy.Mode.Gaussians);
    pwfProxy.setGaussians(vtkPiecewiseFunctionProxy.Defaults.Gaussians);
  }
}

export function getOpacityRangeFromPreset(presetName) {
  const preset = vtkColorMaps.getPresetByName(presetName);
  if (preset.EffectiveRange) {
    return [...preset.EffectiveRange];
  }
  return null;
}

export function getColorFunctionRangeFromPreset(presetName) {
  const preset = vtkColorMaps.getPresetByName(presetName);

  if (!preset) return null;

  const { AbsoluteRange, RGBPoints } = preset;
  if (AbsoluteRange && RGBPoints) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < RGBPoints.length; i += 4) {
      min = Math.min(min, RGBPoints[i]);
      max = Math.max(max, RGBPoints[i]);
    }
    return [min, max];
  }
  return null;
}

export function getLPSDirections(direction) {
  const availableCols = [0, 1, 2];
  const availableRows = [0, 1, 2];
  const lpsDirs = {
    Left: vec3.fromValues(1, 0, 0),
    Right: vec3.fromValues(-1, 0, 0),
    Posterior: vec3.fromValues(0, 1, 0),
    Anterior: vec3.fromValues(0, -1, 0),
    Superior: vec3.fromValues(0, 0, 1),
    Inferior: vec3.fromValues(0, 0, -1),

    Sagittal: 0,
    Coronal: 1,
    Axial: 2,
  };

  for (let i = 0; i < 3; i++) {
    let bestValue = 0;
    let bestValueLoc = [0, 0]; // col, row
    let removeIndices = [0, 0]; // indices into availableCols/Rows for deletion

    availableCols.forEach((col, colIdx) => {
      availableRows.forEach((row, rowIdx) => {
        const value = direction[col * 3 + row];
        if (Math.abs(value) > Math.abs(bestValue)) {
          bestValue = value;
          bestValueLoc = [col, row];
          removeIndices = [colIdx, rowIdx];
        }
      });
    });

    // the row index corresponds to the index of the LPS axis
    const [col, axis] = bestValueLoc;
    const axisVector = direction.slice(col * 3, (col + 1) * 3);
    const vecSign = Math.sign(bestValue);
    const posVector = axisVector.map((c) => c * vecSign);
    const negVector = axisVector.map((c) => c * -vecSign);
    if (axis === 0) {
      // Sagittal
      lpsDirs.Left = posVector;
      lpsDirs.Right = negVector;
      lpsDirs.Sagittal = col;
    } else if (axis === 1) {
      // Coronal
      lpsDirs.Posterior = posVector;
      lpsDirs.Anterior = negVector;
      lpsDirs.Coronal = col;
    } else if (axis === 2) {
      // Axial
      lpsDirs.Superior = posVector;
      lpsDirs.Inferior = negVector;
      lpsDirs.Axial = col;
    }

    availableCols.splice(removeIndices[0], 1);
    availableRows.splice(removeIndices[1], 1);
  }

  return lpsDirs;
}

export function createRenderingPipeline() {
  const actor = vtkVolume.newInstance();
  const mapper = vtkVolumeMapper.newInstance();
  const property = actor.getProperty();
  const cfun = vtkColorTransferFunction.newInstance();
  const ofun = vtkPiecewiseFunction.newInstance();
  property.setRGBTransferFunction(0, cfun);
  property.setScalarOpacity(0, ofun);
  actor.setMapper(mapper);
  return {
    actor,
    mapper,
    property,
    cfun,
    ofun,
  };
}

function updateRenderingProperty(prop, mapper, image) {
  const scalars = image.getPointData().getScalars();
  const dataRange = scalars.getRange();

  const sampleDistance =
    0.7 *
    Math.sqrt(
      image
        .getSpacing()
        .map((v) => v * v)
        .reduce((a, b) => a + b, 0)
    );
  mapper.setSampleDistance(sampleDistance * 2 ** (0.4 * 3.0 - 1.5));

  prop.setScalarOpacityUnitDistance(
    0,
    getDiagonalLength(image.getBounds()) / Math.max(...image.getDimensions())
  );
  prop.setGradientOpacityMinimumValue(0, 0);
  prop.setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);
  // - Use shading based on gradient
  prop.setShade(true);
  prop.setUseGradientOpacity(0, true);
  // - generic good default
  prop.setGradientOpacityMinimumOpacity(0, 0.0);
  prop.setGradientOpacityMaximumOpacity(0, 1.0);
  prop.setAmbient(0.2);
  prop.setDiffuse(0.7);
  prop.setSpecular(0.3);
  prop.setSpecularPower(8.0);
}

export function createVolumeThumbnailer(size) {
  const container = document.createElement("div");
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;

  const scene = vtkGenericRenderWindow.newInstance({
    listenWindowResize: false,
    background: [0.2, 0.3, 0.4],
  });
  scene.setContainer(container);

  const pipeline = createRenderingPipeline();
  const { actor, mapper } = pipeline;
  const renderer = scene.getRenderer();

  const opacityFuncProxy = vtkPiecewiseFunctionProxy.newInstance({
    piecewiseFunction: pipeline.ofun,
  });
  const colorTransferFuncProxy = vtkLookupTableProxy.newInstance({
    lookupTable: pipeline.cfun,
  });

  return {
    scene,
    pipeline,
    opacityFuncProxy,
    colorTransferFuncProxy,
    setInputImage(image) {
      if (image) {
        mapper.setInputData(image);
        updateRenderingProperty(actor.getProperty(), mapper, image);
        if (!renderer.hasViewProp(actor)) {
          renderer.addVolume(actor);
        }
      } else {
        renderer.removeVolume(actor);
      }
    },
    resetCameraWithOrientation(direction, up) {
      const image = mapper.getInputData();
      if (image) {
        const camera = renderer.getActiveCamera();
        const bounds = image.getBounds();
        const center = [
          (bounds[0] + bounds[1]) / 2,
          (bounds[2] + bounds[3]) / 2,
          (bounds[4] + bounds[5]) / 2,
        ];

        const position = vec3.clone(center);
        vec3.sub(position, position, direction);
        camera.setFocalPoint(...center);
        camera.setPosition(...position);
        camera.setDirectionOfProjection(...direction);
        camera.setViewUp(...up);
        renderer.resetCamera();
        renderer.updateLightsGeometryToFollowCamera();
      }
    },
  };
}

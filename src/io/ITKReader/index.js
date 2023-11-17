import vtkITKImageReader from '@kitware/vtk.js/IO/Misc/ITKImageReader';
import vtkITKPolyDataReader from '@kitware/vtk.js/IO/Misc/ITKPolyDataReader';

import extensionToImageIO from 'itk/extensionToImageIO.js';
import readImageArrayBuffer from 'itk/readImageArrayBuffer.js';
import extensionToPolyDataIO from 'itk/extensionToPolyDataIO.js';
import readPolyDataArrayBuffer from 'itk/readPolyDataArrayBuffer.js';

import vtkITKDicomImageReader from './ITKDicomImageReader';

vtkITKImageReader.setReadImageArrayBufferFromITK(readImageArrayBuffer);
vtkITKPolyDataReader.setReadPolyDataArrayBufferFromITK(readPolyDataArrayBuffer);

const imgExtSet = new Set(
  Array.from(extensionToImageIO.keys()).map((ext) => ext.toLowerCase())
);
imgExtSet.delete('json');
export const imageExtensions = Array.from(imgExtSet);

export const polyDataExtensions = Array.from(
  new Set(
    Array.from(extensionToPolyDataIO.keys()).map((ext) => ext.toLowerCase())
  )
);

export const extensions = imageExtensions.concat(polyDataExtensions);

export function registerToMedicalSeg(MedicalSeg) {
  if (MedicalSeg) {
    imageExtensions
      .filter((e) => e !== 'dcm')
      .forEach((extension) =>
        MedicalSeg.registerReader({
          extension,
          name: `${extension.toUpperCase()} Reader`,
          vtkReader: vtkITKImageReader,
          binary: true,
          fileNameMethod: 'setFileName',
        })
      );

    polyDataExtensions.forEach((extension) =>
      MedicalSeg.registerReader({
        extension,
        name: `${extension.toUpperCase()} Reader`,
        vtkReader: vtkITKPolyDataReader,
        binary: true,
        fileNameMethod: 'setFileName',
      })
    );

    MedicalSeg.registerReader({
      extension: 'dcm',
      name: 'DICOM File Series Reader',
      vtkReader: vtkITKDicomImageReader,
      fileNameMethod: 'setFileName',
      fileSeriesMethod: 'readFileSeries',
      binary: true,
    });
  }
}

export default {
  extensions,
  registerToMedicalSeg,
};


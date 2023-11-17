import Vue from 'vue';
import Girder, { RestClient } from '@girder/components/src';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';

Vue.use(Girder);

const { girderRoute } = vtkURLExtract.extractURLParameters();

const apiRoot = girderRoute;

const girderRest = new RestClient({
  apiRoot,
});

const GirderProvider = {
  girderRest,
};

export default GirderProvider;

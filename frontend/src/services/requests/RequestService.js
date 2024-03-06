import iRequestService from '../interfaces/iRequestService.ts';
import BatchRequestService from './BatchRequestService';
import FabNoteRequestService from './FabNoteRequestService';
import PartRequestService from './PartRequestService';
import PlateRequestService from './PlateRequestService';

// register new services with factory class
const registeredServices = {};

registeredServices.batch = BatchRequestService;

registeredServices.plate = PlateRequestService;

registeredServices.part = PartRequestService;

registeredServices.fabNote = FabNoteRequestService;

/**
 * RequestService is a request factory that dynamically chooses
 * a request service based on the request type.
 *
 * @class
 *
 * @param {string} type the type of requeste service to return
 * @param {object} props
 *
 */
class RequestService extends iRequestService {
  constructor(type, props) {
    // eslint-disable-next-line no-constructor-return
    return new registeredServices[type](props);
  }
}

export default RequestService;

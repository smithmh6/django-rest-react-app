import controlBuilder from './ControlBuilder';
import stringBuilder from './StringBuilder';

/**
 * returns the appropriate GUI input or display value
 *
 * @param {object} obj
 * @param {object} key
 * @param {object} attrs
 * @param {object} inputChangeHandler
 * @public
 */
export default function inputFactory(obj, key, attrs, inputChangeHandler) {
  if (Object.hasOwn(attrs, 'control')) {
    return controlBuilder(obj, key, attrs, inputChangeHandler);
  }

  if (Object.hasOwn(attrs, 'dataType')) {
    return stringBuilder(obj, key, attrs);
  }

  if (obj) return obj[key];

  return undefined;
}

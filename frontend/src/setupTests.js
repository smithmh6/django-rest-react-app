// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { MsalContext } from '@azure/msal-react';
import '@testing-library/jest-dom';

window.URL.createObjectURL = jest.fn();
window.alert = jest.fn();
HTMLCanvasElement.prototype.getContext = () => MsalContext;

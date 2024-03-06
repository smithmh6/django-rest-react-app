import React from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';

export default function BatchStepper({ steps, currentStepId }) {
  // Case: Steps not loaded
  if (steps === null) {
    return (
      <ListGroup horizontal>
        <ListGroup.Item>
          <Spinner animation="border" variant="danger" />
        </ListGroup.Item>
      </ListGroup>
    );
  }

  // Case: steps is an error
  if (steps instanceof Error) {
    const alertStyling = { marginBottom: 0 };
    return (
      <Alert variant="danger" dismissible style={alertStyling}>
        <Alert.Heading>Error Fetching steps</Alert.Heading>
        <p>{steps.message}</p>
      </Alert>
    );
  }

  // Attempt to find current step, even if ID is null
  // If ID null, will just return undefined.
  const currentStep = steps.find((step) => step.id === currentStepId);

  // Case: current step not loaded, or not found
  if (!currentStep) {
    // Warn if ID exists, but couldn't find the step
    if (currentStepId) console.warn('Could not find step ', currentStepId);
    return (
      <ListGroup horizontal>
        {steps.map((step) => {
          return <ListGroup.Item key={step.id}>{step.name}</ListGroup.Item>;
        })}
      </ListGroup>
    );
  }

  // Case: loaded, and current step found

  const getVariant = (id) => {
    if (id < currentStepId) return 'secondary';
    if (id === currentStepId) return 'tsw-primary';
    return undefined; // if greater, no variant for now
  };

  return (
    <ListGroup horizontal>
      {steps.map((step) => {
        return (
          <ListGroup.Item key={step.id} variant={getVariant(step.id)}>
            {step.name}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

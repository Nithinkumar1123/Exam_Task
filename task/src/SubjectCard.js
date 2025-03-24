import React from "react";
import { Card, Button } from "react-bootstrap";

const SubjectCard = ({ subject, onView, onSelect, onDelete }) => (
  <Card>
    <Card.Body>
      <Card.Title>{subject.name}</Card.Title>
      <Button onClick={onView} variant="info">View & Add Topics</Button>

      <Button onClick={onDelete} variant="danger" className="ms-2">Delete</Button>
    </Card.Body>
  </Card>
);

export default SubjectCard;

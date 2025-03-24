import { useState } from "react";
import { Card, Button, Spinner, Form, Modal, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { supabase } from "./supabaseClient";
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./App.css";  // Add smooth transitions and effects

function TopicCard({ topic, onTopicChange }) {
  const [loading, setLoading] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(topic.completed);  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState(topic.name);
  const [editedDescription, setEditedDescription] = useState(topic.description);
  const [alert, setAlert] = useState({ message: "", type: "" });

  // ✅ Display alert messages
  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  }

  // ✅ Toggle completion instantly with local state and API call
  async function markComplete() {
    setLoading(true);
    const newCompleted = !localCompleted;  // Optimistically toggle state

    // Instantly update the UI before API call
    setLocalCompleted(newCompleted);

    try {
      const { error } = await supabase
        .from("topics")
        .update({ completed: newCompleted })
        .eq("id", topic.id);

      if (error) {
        console.error("Error updating topic:", error);
        setLocalCompleted(!newCompleted);  // Revert UI on failure
        showAlert("Failed to update topic.", "danger");
      } else {
        showAlert("Topic status updated!", "success");
      }
    } catch (error) {
      console.error("API Error:", error);
      setLocalCompleted(!newCompleted);  // Revert UI on unexpected failure
      showAlert("Something went wrong!", "danger");
    }

    setLoading(false);
  }

  // ✅ Delete topic with confirmation
  async function deleteTopic() {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("topics")
        .delete()
        .eq("id", topic.id);

      if (error) {
        console.error("Error deleting topic:", error);
        showAlert("Failed to delete topic.", "danger");
      } else {
        showAlert("Topic deleted successfully!", "success");
        onTopicChange();  // Trigger re-fetch only once
      }
    } catch (error) {
      console.error("API Error:", error);
      showAlert("Something went wrong!", "danger");
    }

    setLoading(false);
  }

  // ✅ Open the Edit Modal
  function openEditModal() {
    setEditedName(topic.name);
    setEditedDescription(topic.description);
    setShowEditModal(true);
  }

  // ✅ Save the edited topic instantly
  async function saveEdit() {
    setLoading(true);

    // Optimistically update the UI first
    topic.name = editedName;
    topic.description = editedDescription;

    try {
      const { error } = await supabase
        .from("topics")
        .update({
          name: editedName,
          description: editedDescription
        })
        .eq("id", topic.id);

      if (error) {
        console.error("Error updating topic:", error);
        showAlert("Failed to save changes.", "danger");
      } else {
        showAlert("Topic updated successfully!", "success");
        onTopicChange();  // Trigger re-fetch only once
      }
    } catch (error) {
      console.error("API Error:", error);
      showAlert("Something went wrong!", "danger");
    }

    setLoading(false);
    setShowEditModal(false);
  }

  return (
    <>
      {/* ✅ Alert Messages */}
      {alert.message && (
        <Alert variant={alert.type} className="text-center">
          {alert.message}
        </Alert>
      )}

      {/* ✅ Topic Card */}
      <Card className="m-3 shadow-sm topic-card">
        <Card.Body>
          <Card.Title className="d-flex justify-content-between align-items-center">
            <div>
              {localCompleted ? (
                <>
                  <FaCheckCircle className="text-success me-2" />
                  <strong>{topic.name}</strong>
                </>
              ) : (
                <>
                  <FaTimesCircle className="text-warning me-2" />
                  {topic.name}
                </>
              )}
            </div>
          </Card.Title>

          <Card.Text>{topic.description}</Card.Text>

          <div className="d-flex justify-content-between align-items-center">
            {/* ✅ Toggle Complete Button */}
            <Button
              variant={localCompleted ? "success" : "warning"}
              onClick={markComplete}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                localCompleted ? "Mark Incomplete" : "Mark Complete"
              )}
            </Button>

            <div>
              {/* ✅ Stylish Edit Button */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Edit Topic</Tooltip>}
              >
                <Button
                  variant="info"
                  className="me-2"
                  onClick={openEditModal}
                  disabled={loading}
                >
                  <FaEdit />
                </Button>
              </OverlayTrigger>

              {/* ✅ Delete Button */}
              <Button
                variant="danger"
                onClick={deleteTopic}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <FaTrash />
                )}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* ✅ Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Topic Name</Form.Label>
              <Form.Control
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter new topic name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter new topic description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveEdit} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TopicCard;

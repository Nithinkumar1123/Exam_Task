import React, { useEffect, useState } from "react";
import {
  Container,
  Navbar,
  Nav,
  Row,
  Col,
  Button,
  Form,
  Spinner,
  Alert,
  Modal
} from "react-bootstrap";
import { supabase } from "./supabaseClient";
import LeadershipDashboard from "./LeadershipDashboard";
import SubjectCard from "./SubjectCard";
import TopicCard from "./TopicCard";
import ErrorBoundary from "./ErrorBoundary";
import { FaPlus, FaTrash, FaBook, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);  // Modal for adding topics
  const [deleteId, setDeleteId] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });

  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Fetch all subjects
  async function fetchSubjects() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubjects(data);
    } catch (error) {
      console.error(error);
      showAlert("Failed to load subjects", "danger");
    }
    setLoading(false);
  }

  // ✅ Add new subject
  async function addSubject() {
    if (!newSubject.trim()) {
      showAlert("Subject name cannot be empty.", "warning");
      return;
    }

    try {
      const { error } = await supabase.from("subjects").insert([{ name: newSubject }]);
      if (error) throw error;

      setNewSubject("");
      fetchSubjects();
      showAlert("Subject added successfully.", "success");
    } catch (error) {
      showAlert("Failed to add subject.", "danger");
    }
  }

  // ✅ Show confirmation modal before delete
  function confirmDelete(id) {
    setDeleteId(id);
    setShowModal(true);
  }

  // ✅ Delete subject
  async function deleteSubject() {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", deleteId);
      if (error) throw error;

      setShowModal(false);
      setDeleteId(null);
      fetchSubjects();
      showAlert("Subject deleted successfully.", "success");
    } catch (error) {
      showAlert("Failed to delete subject.", "danger");
    }
  }

  // ✅ Fetch topics by subject
  async function fetchTopics(subjectId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTopics(data);
      setSelectedSubject(subjectId);
      setShowTopicModal(true);   // Open the topic modal on selecting a subject
    } catch (error) {
      showAlert("Failed to load topics.", "danger");
    }
    setLoading(false);
  }

  // ✅ Add new topic
  async function addTopic() {
    if (!topicName.trim() || !topicDescription.trim() || !selectedSubject) {
      showAlert("Please fill in all topic details.", "warning");
      return;
    }

    try {
      const { error } = await supabase.from("topics").insert([
        {
          name: topicName,
          description: topicDescription,
          subject_id: selectedSubject,
          completed: false
        }
      ]);

      if (error) throw error;

      setTopicName("");
      setTopicDescription("");
      fetchTopics(selectedSubject);
      setShowTopicModal(false);   // Close the modal after adding
      showAlert("Topic added successfully.", "success");
    } catch (error) {
      showAlert("Failed to add topic.", "danger");
    }
  }

  // ✅ Display alerts
  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  }

  return (
    <ErrorBoundary>
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>📚 Task Manager</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Item className="text-white">Created by NK</Nav.Item>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        {alert.message && (
          <Alert variant={alert.type} className="text-center">
            {alert.message}
          </Alert>
        )}

        <LeadershipDashboard />

        <hr />

        <h3>Subjects <FaBook /></h3>
        <Row className="mb-3">
          <Col md={6}>
            <Form>
              <Form.Group>
                <Form.Label>New Subject</Form.Label>
                <Form.Control
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter subject name"
                />
              </Form.Group>
              <Button variant="success" className="mt-2" onClick={addSubject}>
                <FaPlus /> Add Subject
              </Button>
            </Form>
          </Col>
        </Row>

        <Row>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            subjects.map((subject) => (
              <Col key={subject.id} md={4}>
                <SubjectCard
                  subject={subject}
                  onView={() => fetchTopics(subject.id)}  // Trigger topic modal
                  onDelete={() => confirmDelete(subject.id)}
                />
              </Col>
            ))
          )}
        </Row>

        <hr />
        <h3>Topics</h3>
<Row>
  {topics.length > 0 ? (
    topics.map((topic) => (
      <Col key={topic.id} md={4}>
        <TopicCard topic={topic} refreshTopics={() => fetchTopics(selectedSubject)} />
      </Col>
    ))
  ) : (
    <Col className="text-center py-5">
      <h5 className="text-muted">No topics found. Start by adding a new topic!</h5>
      <img 
        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" 
        alt="No topics" 
        style={{ width: "150px", opacity: 0.5, marginTop: "20px" }} 
      />
    </Col>
  )}
</Row>
        <hr />

      </Container>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header  closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this subject?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={deleteSubject}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Pop-up Modal for Adding Topics */}
      <Modal show={showTopicModal} onHide={() => setShowTopicModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Topic Name</Form.Label>
              <Form.Control
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Enter topic name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Topic Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder="Enter topic description"
              />
            </Form.Group>
            <Button variant="success" onClick={addTopic}>
              <FaPlus /> Add Topic
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </ErrorBoundary>
  );
}

export default App;

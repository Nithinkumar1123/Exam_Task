import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Container, Nav, Form, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import ProductCard from './productCard';
import { supabase } from './supabaseClient';
import LeadershipDashboard from "./LeadershipDashboard";

function Math() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order('completed', { ascending: true });

      if (error) throw error;

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      alert(`Error fetching products: ${error.message}`);
    }
  }

  async function createProduct() {
    if (!name.trim() || !description.trim()) {
      alert("Please fill in both Subject and Description.");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .insert([{ name, description, completed: false }]);

      if (error) throw error;

      setName("");
      setDescription("");
      getProducts();
    } catch (error) {
      alert(`Error creating product: ${error.message}`);
    }
  }

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Exam Management</Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Item className="text-white">Created by NK</Nav.Item>
          </Nav>
        </Container>
      </Navbar>

      <Container className="my-4">
      <h1 className="text-center mt-5">🛠️ Task Management with Leadership Dashboard</h1>
      <LeadershipDashboard />
      
      <hr />
        <Row>
          <Col xs={12} md={8} className="my-3">
            <h3>Create a Test Plan</h3>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter subject"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter topic description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Button onClick={createProduct} variant="primary">
              Create Topic
            </Button>
          </Col>
        </Row>

        <hr />

        <h3>Pending Topics</h3>
        <Row xs={1} md={2} lg={3} className="g-4">
          {products.filter(p => !p.completed).map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} onProductChange={getProducts} />
            </Col>
          ))}
        </Row>

        <hr />

        <h3>Completed Topics ✅</h3>
        <Row xs={1} md={2} lg={3} className="g-4">
          {products.filter(p => p.completed).map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} onProductChange={getProducts} />
            </Col>
          ))}
        </Row>

      </Container>
      

    </>
  );
}

export default Math;

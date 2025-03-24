import React, { useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { supabase } from "./supabaseClient";

function ProductCard({ product, onProductChange }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");

  async function toggleCompleted() {
    try {
      const { error } = await supabase
        .from("products")
        .update({ completed: !product.completed })
        .eq("id", product.id);

      if (error) throw error;
      onProductChange();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }

  async function updateProduct() {
    try {
      const { error } = await supabase
        .from("products")
        .update({ name, description })
        .eq("id", product.id);

      if (error) throw error;

      onProductChange();
      setEditing(false);
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  }

  async function deleteProduct() {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      onProductChange();
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  }

  return (
    <Card style={{ width: "18rem", margin: "1rem" }}>
      <Card.Body>
        {editing ? (
          <>
            <Form.Group>
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
              />
            </Form.Group>

            <Form.Group className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
              />
            </Form.Group>

            <Button className="mt-3" onClick={updateProduct}>
              Update Product
            </Button>
          </>
        ) : (
          <>
            <Card.Title>{product.name}</Card.Title>
            <Card.Text>{product.description}</Card.Text>
            <div className="d-flex justify-content-between">
              <Button
                variant={product.completed ? "success" : "warning"}
                onClick={toggleCompleted}
              >
                {product.completed ? "Completed" : "Mark as Completed"}
              </Button>
              <Button variant="danger" onClick={deleteProduct}>
                Delete
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default ProductCard;  // ✅ Ensure you have this export

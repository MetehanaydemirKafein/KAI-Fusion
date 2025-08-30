import React, { useState, useCallback, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useSnackbar } from "notistack";
import KafkaProducerVisual from "./KafkaProducerVisual";
import KafkaProducerConfigForm from "./KafkaProducerConfigForm";
import type { KafkaProducerData, KafkaProducerNodeProps } from "./types";

export default function KafkaProducerNode({ data, id }: KafkaProducerNodeProps) {
  const { setNodes, getEdges } = useReactFlow();
  const { enqueueSnackbar } = useSnackbar();
  const [isHovered, setIsHovered] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  
  // Default data to prevent undefined errors
  const defaultData: KafkaProducerData = {
    bootstrap_servers: "",
    topic: "",
    client_id: "",
    message_format: "json",
    message_key_template: "",
    message_value_template: "{{ data }}",
    headers: {},
    acks: "1",
    retries: 3,
    batch_size: 16384,
    linger_ms: 0,
    compression_type: "none",
    enable_idempotence: true,
    security_protocol: "PLAINTEXT",
    username: "",
    password: "",
    max_request_size: 1048576,
    delivery_timeout_ms: 120000,
    partitioner: "default",
  };
  
  const safeData = { ...defaultData, ...data };
  const [configData, setConfigData] = useState<KafkaProducerData>(safeData);
  const edges = getEdges?.() ?? [];

  // Update configData when data prop changes
  useEffect(() => {
    setConfigData({ ...defaultData, ...data });
  }, [data]);

  const handleSaveConfig = useCallback(
    (values: Partial<KafkaProducerData>) => {
      try {
        const updatedData = { ...safeData, ...values };
        setConfigData(updatedData);
        
        // Update the node data
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id ? { ...node, data: updatedData } : node
          )
        );

        // Close config mode
        setIsConfigMode(false);

        // Show success notification
        enqueueSnackbar("Kafka Producer configuration saved successfully!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        console.error("Error saving configuration:", error);
        enqueueSnackbar("Failed to save configuration. Please try again.", {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    },
    [setNodes, id, enqueueSnackbar, safeData]
  );

  const handleCancel = useCallback(() => {
    setIsConfigMode(false);
    enqueueSnackbar("Configuration cancelled", {
      variant: "info",
      autoHideDuration: 2000,
    });
  }, [enqueueSnackbar]);

  const handleDeleteNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
      enqueueSnackbar("Kafka Producer node deleted", {
        variant: "info",
        autoHideDuration: 2000,
      });
    },
    [setNodes, id, enqueueSnackbar]
  );

  const isHandleConnected = (handleId: string, isSource = false) =>
    edges.some((edge) =>
      isSource
        ? edge.source === id && edge.sourceHandle === handleId
        : edge.target === id && edge.targetHandle === handleId
    );

  // Validation function
  const validate = (values: Partial<KafkaProducerData>) => {
    const errors: any = {};
    
    if (!values?.bootstrap_servers) {
      errors.bootstrap_servers = "Bootstrap servers are required";
    }
    
    if (!values?.topic) {
      errors.topic = "Topic is required";
    }
    
    if (values?.batch_size && values.batch_size < 1) {
      errors.batch_size = "Batch size must be at least 1";
    }
    
    if (values?.retries && values.retries < 0) {
      errors.retries = "Retries cannot be negative";
    }

    if (values?.linger_ms && values.linger_ms < 0) {
      errors.linger_ms = "Linger time cannot be negative";
    }

    if (values?.security_protocol &&
        (values.security_protocol === "SASL_PLAINTEXT" || values.security_protocol === "SASL_SSL")) {
      if (!values?.username) {
        errors.username = "Username is required for SASL authentication";
      }
      if (!values?.password) {
        errors.password = "Password is required for SASL authentication";
      }
    }

    return errors;
  };

  if (isConfigMode) {
    return (
      <KafkaProducerConfigForm
        initialValues={configData || {
          bootstrap_servers: "localhost:9092",
          topic: "",
          client_id: "kai-fusion-producer",
          message_format: "json",
          message_key_template: "",
          message_value_template: "{{ data }}",
          headers: {},
          acks: "1",
          retries: 3,
          batch_size: 16384,
          linger_ms: 0,
          compression_type: "none",
          enable_idempotence: true,
          security_protocol: "PLAINTEXT",
          username: "",
          password: "",
          max_request_size: 1048576,
          delivery_timeout_ms: 120000,
          partitioner: "default",
        }}
        validate={validate}
        onSubmit={handleSaveConfig}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <KafkaProducerVisual
      data={safeData}
      isHovered={isHovered}
      onDoubleClick={() => setIsConfigMode(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDelete={handleDeleteNode}
      isHandleConnected={isHandleConnected}
    />
  );
}
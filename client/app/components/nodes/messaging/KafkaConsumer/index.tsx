import React, { useState, useCallback, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import { useSnackbar } from "notistack";
import KafkaConsumerVisual from "./KafkaConsumerVisual";
import KafkaConsumerConfigForm from "./KafkaConsumerConfigForm";
import {
  type KafkaConsumerNodeProps,
  type KafkaConsumerData,
} from "./types";

export default function KafkaConsumerNode({ data, id }: KafkaConsumerNodeProps) {
  const { setNodes, getEdges } = useReactFlow();
  const { enqueueSnackbar } = useSnackbar();
  const [isHovered, setIsHovered] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  
  // Default data to prevent undefined errors
  const defaultData: KafkaConsumerData = {
    bootstrap_servers: "",
    topic: "",
    group_id: "",
    message_format: "json",
    batch_size: 100,
    auto_offset_reset: "latest",
    timeout_ms: 30000,
    max_poll_records: 500,
    max_messages: 0,
    security_protocol: "PLAINTEXT",
    username: "",
    password: "",
    message_filter: "",
    transform_template: "",
    enable_auto_commit: true,
  };
  
  const safeData = { ...defaultData, ...data };
  const [configData, setConfigData] = useState<KafkaConsumerData>(safeData);
  const edges = getEdges?.() ?? [];

  // Update configData when data prop changes
  useEffect(() => {
    setConfigData({ ...defaultData, ...data });
  }, [data]);

  const handleSaveConfig = useCallback(
    (values: Partial<KafkaConsumerData>) => {
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
        enqueueSnackbar("Kafka Consumer configuration saved successfully!", {
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
      enqueueSnackbar("Kafka Consumer node deleted", {
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
  const validate = (values: Partial<KafkaConsumerData>) => {
    const errors: any = {};
    
    if (!values?.bootstrap_servers) {
      errors.bootstrap_servers = "Bootstrap servers are required";
    }
    
    if (!values?.topic) {
      errors.topic = "Topic is required";
    }
    
    if (values?.timeout_ms && values.timeout_ms < 1000) {
      errors.timeout_ms = "Timeout must be at least 1000ms";
    }
    
    if (values?.batch_size && values.batch_size < 1) {
      errors.batch_size = "Batch size must be at least 1";
    }
    
    if (values?.max_poll_records && values.max_poll_records < 1) {
      errors.max_poll_records = "Max poll records must be at least 1";
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
      <KafkaConsumerConfigForm
        initialValues={configData || {
          bootstrap_servers: "localhost:9092",
          topic: "",
          group_id: "",
          message_format: "json",
          batch_size: 100,
          auto_offset_reset: "latest",
          timeout_ms: 30000,
          max_poll_records: 500,
          max_messages: 0,
          security_protocol: "PLAINTEXT",
          username: "",
          password: "",
          message_filter: "",
          transform_template: "",
          enable_auto_commit: true,
        }}
        validate={validate}
        onSubmit={handleSaveConfig}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <KafkaConsumerVisual
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
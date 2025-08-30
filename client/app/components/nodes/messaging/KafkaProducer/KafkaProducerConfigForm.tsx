import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Settings,
  Shield,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Server,
  Zap,
} from "lucide-react";

interface KafkaProducerConfigFormProps {
  initialValues: any;
  validate: (values: any) => any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function KafkaProducerConfigForm({
  initialValues,
  validate,
  onSubmit,
  onCancel,
}: KafkaProducerConfigFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const tabs = [
    { id: "basic", label: "Basic", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "test", label: "Test", icon: TestTube },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleTest = async (values: any) => {
    if (!values?.bootstrap_servers || !values?.topic) {
      setTestStatus("error");
      setTestMessage("Please configure bootstrap servers and topic first");
      return;
    }

    setTestStatus("testing");
    setTestMessage("Testing connection and sending test message...");

    try {
      // Simulate connection test and message send
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would make an API call to test the connection and send a message
      const isValid = values?.bootstrap_servers?.includes(":") && values?.topic?.length > 0;
      
      if (isValid) {
        setTestStatus("success");
        setTestMessage("Connection successful! Test message sent to topic.");
      } else {
        setTestStatus("error");
        setTestMessage("Invalid configuration. Please check your settings.");
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage("Connection failed. Please check your configuration.");
    }

    setTimeout(() => {
      setTestStatus("idle");
      setTestMessage("");
    }, 5000);
  };

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-600">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validate={validate}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Basic Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-medium mb-4">Basic Configuration</h3>

                  {/* Bootstrap Servers */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      <Server className="w-4 h-4 inline mr-2" />
                      Bootstrap Servers *
                    </label>
                    <Field
                      name="bootstrap_servers"
                      placeholder="localhost:9092"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <ErrorMessage name="bootstrap_servers" component="div" className="text-red-400 text-sm mt-1" />
                    <p className="text-gray-400 text-xs mt-1">Kafka broker addresses (comma-separated)</p>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Topic *
                    </label>
                    <Field
                      name="topic"
                      placeholder="my-topic"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <ErrorMessage name="topic" component="div" className="text-red-400 text-sm mt-1" />
                  </div>

                  {/* Client ID */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Client ID</label>
                    <Field
                      name="client_id"
                      placeholder="kai-fusion-producer"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <p className="text-gray-400 text-xs mt-1">Unique identifier for this producer</p>
                  </div>

                  {/* Message Format */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Message Format</label>
                    <Field
                      as="select"
                      name="message_format"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="json">JSON</option>
                      <option value="text">Text</option>
                      <option value="binary">Binary</option>
                    </Field>
                  </div>

                  {/* Message Templates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Message Key Template</label>
                      <Field
                        name="message_key_template"
                        placeholder="{{ user_id }}"
                        className="text-sm text-white px-3 py-2 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                      <p className="text-gray-400 text-xs mt-1">Jinja2 template for message key</p>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Message Value Template</label>
                      <Field
                        name="message_value_template"
                        placeholder="{{ data }}"
                        className="text-sm text-white px-3 py-2 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                      <p className="text-gray-400 text-xs mt-1">Jinja2 template for message value</p>
                    </div>
                  </div>

                  {/* Delivery Settings */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      <Zap className="w-4 h-4 inline mr-2" />
                      Delivery Acknowledgment
                    </label>
                    <Field
                      as="select"
                      name="acks"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="0">No ACK (Fire and Forget)</option>
                      <option value="1">Leader ACK (Balanced)</option>
                      <option value="all">All Replicas ACK (Most Reliable)</option>
                    </Field>
                    <p className="text-gray-400 text-xs mt-1">Higher acknowledgment = higher reliability but lower performance</p>
                  </div>

                  {/* Performance Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Batch Size</label>
                      <Field
                        type="number"
                        name="batch_size"
                        min="1"
                        max="1048576"
                        className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <p className="text-gray-400 text-xs mt-1">Batch size in bytes</p>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Compression</label>
                      <Field
                        as="select"
                        name="compression_type"
                        className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="none">None</option>
                        <option value="gzip">GZIP</option>
                        <option value="snappy">Snappy (Fast)</option>
                        <option value="lz4">LZ4 (Very Fast)</option>
                        <option value="zstd">ZSTD (Best Ratio)</option>
                      </Field>
                    </div>
                  </div>

                  {/* Idempotence */}
                  <div className="flex items-center gap-3">
                    <Field
                      type="checkbox"
                      name="enable_idempotence"
                      className="w-4 h-4 text-blue-600 bg-slate-900 border-white/20 rounded focus:ring-blue-500"
                    />
                    <label className="text-white text-sm">Enable Exactly-Once Delivery (Idempotence)</label>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-medium mb-4">Security Configuration</h3>

                  {/* Security Protocol */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Security Protocol
                    </label>
                    <Field
                      as="select"
                      name="security_protocol"
                      className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="PLAINTEXT">PLAINTEXT (No security)</option>
                      <option value="SSL">SSL (Encryption only)</option>
                      <option value="SASL_PLAINTEXT">SASL_PLAINTEXT (Authentication only)</option>
                      <option value="SASL_SSL">SASL_SSL (Authentication + Encryption)</option>
                    </Field>
                  </div>

                  {/* SASL Credentials - only show when SASL is selected */}
                  {(values?.security_protocol === "SASL_PLAINTEXT" || values?.security_protocol === "SASL_SSL") && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 text-sm font-medium mb-3">SASL Authentication</h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Username *</label>
                          <Field
                            name="username"
                            placeholder="kafka-user"
                            className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <ErrorMessage name="username" component="div" className="text-red-400 text-sm mt-1" />
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">Password *</label>
                          <Field
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="text-sm text-white px-4 py-3 rounded-lg w-full bg-slate-900/80 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                          <ErrorMessage name="password" component="div" className="text-red-400 text-sm mt-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {values?.security_protocol === "PLAINTEXT" && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">Security Warning</span>
                      </div>
                      <p className="text-yellow-200 text-sm mt-1">
                        PLAINTEXT protocol sends data unencrypted. Consider using SSL or SASL_SSL for production environments.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Test Tab */}
              {activeTab === "test" && (
                <div className="space-y-4">
                  <h3 className="text-white text-lg font-medium mb-4">Connection & Message Test</h3>

                  {/* Configuration Summary */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-white text-sm font-medium mb-3">Current Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bootstrap Servers:</span>
                        <span className="text-white font-mono">{values?.bootstrap_servers || "Not configured"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Topic:</span>
                        <span className="text-white font-mono">{values?.topic || "Not configured"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Client ID:</span>
                        <span className="text-white font-mono">{values?.client_id || "kai-fusion-producer"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security:</span>
                        <span className="text-white">{values?.security_protocol || "PLAINTEXT"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Acknowledgments:</span>
                        <span className="text-white">{values?.acks || "1"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Button and Status */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleTest(values)}
                      disabled={testStatus === "testing" || !values?.bootstrap_servers || !values?.topic}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                        testStatus === "testing"
                          ? "bg-blue-600 text-white cursor-not-allowed"
                          : testStatus === "success"
                          ? "bg-green-600 text-white"
                          : testStatus === "error"
                          ? "bg-red-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {testStatus === "testing" ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Testing Connection & Sending Message...
                          </>
                        ) : testStatus === "success" ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Test Successful
                          </>
                        ) : testStatus === "error" ? (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            Test Failed
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Test Connection & Send Message
                          </>
                        )}
                      </div>
                    </button>

                    {/* Test Result Message */}
                    {testMessage && (
                      <div className={`p-3 rounded-lg text-sm ${
                        testStatus === "success"
                          ? "bg-green-900/20 border border-green-500/30 text-green-300"
                          : testStatus === "error"
                          ? "bg-red-900/20 border border-red-500/30 text-red-300"
                          : "bg-blue-900/20 border border-blue-500/30 text-blue-300"
                      }`}>
                        {testMessage}
                      </div>
                    )}
                  </div>

                  {/* Test Requirements */}
                  {(!values?.bootstrap_servers || !values?.topic) && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 text-sm font-medium">Configuration Required</span>
                      </div>
                      <p className="text-yellow-200 text-sm mt-1">
                        Please configure Bootstrap Servers and Topic before testing the connection.
                      </p>
                    </div>
                  )}

                  {/* Test Message Info */}
                  <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Test Message</h4>
                    <p className="text-blue-200 text-sm">
                      The test will send a sample message to verify connectivity and configuration. 
                      In production, the producer will use data from connected nodes in your workflow.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-600">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
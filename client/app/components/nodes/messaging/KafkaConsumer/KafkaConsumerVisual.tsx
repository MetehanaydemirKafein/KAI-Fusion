import React from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Database,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { KafkaConsumerData } from "./types";

interface KafkaConsumerVisualProps {
  data: KafkaConsumerData;
  isHovered: boolean;
  onDoubleClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isHandleConnected: (handleId: string, isSource?: boolean) => boolean;
}

export default function KafkaConsumerVisual({
  data,
  isHovered,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onDelete,
  isHandleConnected,
}: KafkaConsumerVisualProps) {
  const getStatusColor = () => {
    switch (data?.validationStatus) {
      case "success":
        return "border-green-500 bg-green-900/20";
      case "error":
        return "border-red-500 bg-red-900/20";
      default:
        return "border-gray-600 bg-slate-900/80";
    }
  };

  const getStatusIcon = () => {
    switch (data?.validationStatus) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className={`w-3 h-3 border-2 ${
          isHandleConnected("input") ? "bg-blue-500 border-blue-500" : "bg-gray-600 border-gray-400"
        }`}
        style={{ left: -6 }}
      />

      {/* Main Node */}
      <div
        className={`
          relative min-w-64 rounded-lg border-2 transition-all duration-200 backdrop-blur-sm
          ${getStatusColor()}
          ${isHovered ? "shadow-lg scale-105" : "shadow-md"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-600/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-white font-medium text-sm">
                Kafka Consumer
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isHovered && (
            <div className="flex items-center gap-1">
              <button
                onClick={onDoubleClick}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="Configure"
              >
                <Settings className="w-3.5 h-3.5 text-gray-300" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                title="Delete Node"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Configuration Info */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bootstrap Servers:</span>
              <span className="text-white font-mono truncate max-w-32">
                {data?.bootstrap_servers || "Not configured"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Topic:</span>
              <span className="text-white font-mono truncate max-w-32">
                {data?.topic || "Not configured"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Group ID:</span>
              <span className="text-white font-mono truncate max-w-32">
                {data?.group_id || "Auto-generated"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Format:</span>
              <span className="text-white uppercase">
                {data?.message_format || "JSON"}
              </span>
            </div>
          </div>

          {/* Security Indicator */}
          {data?.security_protocol && data.security_protocol !== "PLAINTEXT" && (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>Secured ({data.security_protocol})</span>
              </div>
            </div>
          )}

          {/* Configuration Status */}
          {!data?.bootstrap_servers || !data?.topic ? (
            <div className="text-xs text-yellow-300 bg-yellow-900/30 rounded p-2 border border-yellow-500/30">
              <div className="font-medium">Configuration Required</div>
              <div className="mt-1">Double-click to configure bootstrap servers and topic</div>
            </div>
          ) : (
            <div className="text-xs text-green-300 bg-green-900/30 rounded p-2 border border-green-500/30">
              <div className="font-medium">Ready to Consume</div>
              <div className="mt-1">Configuration complete</div>
            </div>
          )}
        </div>
      </div>

      {/* Output Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="messages"
        className={`w-3 h-3 border-2 ${
          isHandleConnected("messages", true) ? "bg-green-500 border-green-500" : "bg-gray-600 border-gray-400"
        }`}
        style={{ right: -6, top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="stats"
        className={`w-3 h-3 border-2 ${
          isHandleConnected("stats", true) ? "bg-blue-500 border-blue-500" : "bg-gray-600 border-gray-400"
        }`}
        style={{ right: -6, top: "70%" }}
      />
    </div>
  );
}